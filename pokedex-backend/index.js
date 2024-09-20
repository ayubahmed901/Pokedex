const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;
const cache = {};


app.use(express.static('pokedex-frontend'));
app.get('/pokemon/:name', async (req, res) => {
    const { name } = req.params;
    const pokemonName = name.toLowerCase();
    if (cache[pokemonName]) {
        return res.json(cache[pokemonName]);
    }
    
    try {
        console.log(`Requesting from API: https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
        const pokemonData = response.data;
        cache[pokemonName] = pokemonData;
        res.json(pokemonData);
    } catch (error) {
        console.error('Error fetching Pokémon data:', error.message);
        console.error('Error details:', error.response ? error.response.data : error.message);
        res.status(500).send('Error fetching Pokémon data');
    }
});

app.get('/search', async (req, res) => {
    const { type, weight, ability, limit = 100, offset = 0 } = req.query;
    const cacheKey = `filter-${type || 'all'}-${weight || 'all'}-${ability || 'all'}-${limit}-${offset}`;
    if (cache[cacheKey]) {
        console.log(`Returning cached result for filters: ${cacheKey}`);
        return res.json(cache[cacheKey]);
    }

    try {
        if (!cache['pokemonList']) {
            console.log('Requesting Pokémon list from API');
            const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=151');
            cache['pokemonList'] = response.data.results;
        }

        const pokemonList = cache['pokemonList'].slice(offset, offset + limit);

        const filteredPokemon = await Promise.all(
            pokemonList.map(async (pokemon) => {
                if (!cache[pokemon.name]) {
                    const pokeResponse = await axios.get(pokemon.url);
                    cache[pokemon.name] = pokeResponse.data;
                }
                const pokemonData = cache[pokemon.name];
                const normalizedType = type ? type.toLowerCase() : null;
                const hasType = normalizedType ? pokemonData.types.some(t => t.type.name.toLowerCase() === normalizedType) : true;
                const matchesWeight = weight ? pokemonData.weight == weight : true;
                const normalizedAbility = ability ? ability.toLowerCase() : null;
                const hasAbility = normalizedAbility ? pokemonData.abilities.some(a => a.ability.name.toLowerCase() === normalizedAbility) : true;

                console.log(`Checking ${pokemonData.name} - Type Match: ${hasType}, Weight Match: ${matchesWeight}, Ability Match: ${hasAbility}`);

                if (hasType && matchesWeight && hasAbility) {
                    return {
                        name: pokemonData.name,
                        types: pokemonData.types.map(t => t.type.name),
                        weight: pokemonData.weight,
                        abilities: pokemonData.abilities.map(a => a.ability.name),
                        image: pokemonData.sprites.front_default
                    };
                }
                return null;
            })
        );

        const result = filteredPokemon.filter(pokemon => pokemon !== null);
        cache[cacheKey] = result;
        res.json(result);
    } catch (error) {
        console.error('Error fetching Pokémon data:', error.message);
        console.error('Error details:', error.response ? error.response.data : error.message);
        res.status(500).send('Error fetching Pokémon data');
    }
});



app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
