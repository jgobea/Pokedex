// services/pokemonService.ts
export interface Pokemon {
  id: number;
  name: string;
  image: string;
  types?: string[];
  abilities?: string[];
  stats?: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
}

// Obtener la cantidad total de Pokémon disponibles
export const getTotalPokemonCount = async (): Promise<number> => {
  try {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1');
    const data = await response.json();
    return data.count;
  } catch (error) {
    console.error("Error fetching total Pokémon count:", error);
    return 0;
  }
};

// Función optimizada para obtener lista de Pokémon
export const getPokemonList = async (limit: number = 20, offset: number = 0): Promise<Pokemon[]> => {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
    const data = await response.json();
    
    const pokemonPromises = data.results.map(async (result: any) => {
      try {
        const pokemonResponse = await fetch(result.url);
        const pokemonData = await pokemonResponse.json();
        
        return {
          id: pokemonData.id,
          name: pokemonData.name,
          image: pokemonData.sprites.other['official-artwork']?.front_default || 
                 pokemonData.sprites.front_default,
          types: pokemonData.types.map((type: any) => type.type.name),
        };
      } catch (error) {
        console.error(`Error fetching Pokémon from URL ${result.url}:`, error);
        return null;
      }
    });

    const pokemonList = await Promise.all(pokemonPromises);
    return pokemonList.filter(pokemon => pokemon !== null) as Pokemon[];
  } catch (error) {
    console.error("Error fetching Pokémon list:", error);
    return [];
  }
};

// Función para obtener un Pokémon por ID
export const getPokemonById = async (id: number): Promise<Pokemon | null> => {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const pokemonData = await response.json();
    
    return {
      id: pokemonData.id,
      name: pokemonData.name,
      image: pokemonData.sprites.other['official-artwork'].front_default || 
             pokemonData.sprites.front_default,
      types: pokemonData.types.map((type: any) => type.type.name),
      abilities: pokemonData.abilities.map((ability: any) => ability.ability.name),
      stats: {
        hp: pokemonData.stats[0].base_stat,
        attack: pokemonData.stats[1].base_stat,
        defense: pokemonData.stats[2].base_stat,
        specialAttack: pokemonData.stats[3].base_stat,
        specialDefense: pokemonData.stats[4].base_stat,
        speed: pokemonData.stats[5].base_stat,
      }
    };
  } catch (error) {
    console.error(`Error fetching Pokémon with ID ${id}:`, error);
    return null;
  }
};

// Función para buscar Pokémon por nombre
export const searchPokemonByName = async (name: string): Promise<Pokemon | null> => {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
    const pokemonData = await response.json();
    
    return {
      id: pokemonData.id,
      name: pokemonData.name,
      image: pokemonData.sprites.other['official-artwork'].front_default || 
             pokemonData.sprites.front_default,
      types: pokemonData.types.map((type: any) => type.type.name),
      abilities: pokemonData.abilities.map((ability: any) => ability.ability.name),
      stats: {
        hp: pokemonData.stats[0].base_stat,
        attack: pokemonData.stats[1].base_stat,
        defense: pokemonData.stats[2].base_stat,
        specialAttack: pokemonData.stats[3].base_stat,
        specialDefense: pokemonData.stats[4].base_stat,
        speed: pokemonData.stats[5].base_stat,
      }
    };
  } catch (error) {
    console.error(`Error fetching Pokémon with name ${name}:`, error);
    return null;
  }
};