async function searchPokemon() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    console.log('Searching for:', searchTerm);

    try {
        const response = await fetch(`/pokemon/${searchTerm}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Received data:', data);

        const container = document.getElementById('pokemon-container');
        container.innerHTML = '';

        if (data && data.name) {
            const pokemonCard = document.createElement('div');
            pokemonCard.className = 'pokemon-card';

            pokemonCard.innerHTML = `
                <h2>${data.name}</h2>
                <img src="${data.sprites.front_default}" alt="${data.name}">
                <p>Weight: ${data.weight}</p>
                <p>Types: ${data.types.map(t => t.type.name).join(', ')}</p>
            `;

            container.appendChild(pokemonCard);
        } else {
            container.innerHTML = '<p>No Pokémon found.</p>';
        }
    } catch (error) {
        console.error('Error fetching Pokémon data:', error);
        const container = document.getElementById('pokemon-container');
        container.innerHTML = '<p>Error fetching Pokémon data. Please try again.</p>';
    }
}

document.getElementById('search-btn').addEventListener('click', searchPokemon);

async function applyFilters() {
    const type = document.getElementById('type').value.toLowerCase();
    const weight = document.getElementById('weight').value;
    const ability = document.getElementById('ability').value.toLowerCase();
    const limit = document.getElementById('limit').value || 100;
    const offset = document.getElementById('offset').value || 0;

    try {
        const response = await fetch(`/search?type=${type}&weight=${weight}&ability=${ability}&limit=${limit}&offset=${offset}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Filtered data:', data);

        const container = document.getElementById('pokemon-container');
        container.innerHTML = '';

        if (data && data.length > 0) {
            data.forEach(pokemon => {
                const pokemonCard = document.createElement('div');
                pokemonCard.className = 'pokemon-card';

                pokemonCard.innerHTML = `
                    <h2>${pokemon.name}</h2>
                    <img src="${pokemon.image}" alt="${pokemon.name}">
                    <p>Weight: ${pokemon.weight}</p>
                    <p>Types: ${pokemon.types.join(', ')}</p>
                `;

                container.appendChild(pokemonCard);
            });
        } else {
            container.innerHTML = '<p>No Pokémon found with the specified filters.</p>';
        }
    } catch (error) {
        console.error('Error fetching Pokémon data:', error);
        const container = document.getElementById('pokemon-container');
        container.innerHTML = '<p>Error fetching Pokémon data. Please try again.</p>';
    }
}

document.getElementById('filter-btn').addEventListener('click', applyFilters);
