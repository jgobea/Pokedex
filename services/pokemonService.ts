export interface Pokemon {
  id: number;
  name: string;
  image: any; // require() returns a number
}

export interface PokemonDetail extends Pokemon {
  types: string[];
  weaknesses: string[];
  weight: string;
  height: string;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  };
  evolutionLine: {
    name: string;
    image: any;
  }[];
}

const pokemonListData: Pokemon[] = [
  {
    id: 1,
    name: "Bulbasaur",
    image: require("../assets/images/Bulbasaur.png"),
  },
  {
    id: 2,
    name: "Ivysaur",
    image: require("../assets/images/Ivysaur.png"),
  },
  {
    id: 3,
    name: "Venusaur",
    image: require("../assets/images/Venusaur.png"),
  },
];

const pokemonDetailsData: Record<number, PokemonDetail> = {
  1: {
    id: 1,
    name: "Bulbasaur",
    image: require("../assets/images/Bulbasaur.png"),
    types: ["grass", "poison"],
    weaknesses: ["fire", "ice", "flying", "psychic"],
    weight: "6.9 kg",
    height: "0.7 m",
    stats: {
      hp: 45,
      attack: 49,
      defense: 49,
      speed: 45,
    },
    evolutionLine: [
      { name: "Bulbasaur", image: require("../assets/images/Bulbasaur.png") },
      { name: "Ivysaur", image: require("../assets/images/Ivysaur.png") },
      { name: "Venusaur", image: require("../assets/images/Venusaur.png") },
    ],
  },
  2: {
    id: 2,
    name: "Ivysaur",
    image: require("../assets/images/Ivysaur.png"),
    types: ["grass", "poison"],
    weaknesses: ["fire", "ice", "flying", "psychic"],
    weight: "13.0 kg",
    height: "1.0 m",
    stats: {
      hp: 60,
      attack: 62,
      defense: 63,
      speed: 60,
    },
    evolutionLine: [
        { name: "Bulbasaur", image: require("../assets/images/Bulbasaur.png") },
        { name: "Ivysaur", image: require("../assets/images/Ivysaur.png") },
        { name: "Venusaur", image: require("../assets/images/Venusaur.png") },
    ],
  },
  3: {
    id: 3,
    name: "Venusaur",
    image: require("../assets/images/Venusaur.png"),
    types: ["grass", "poison"],
    weaknesses: ["fire", "ice", "flying", "psychic"],
    weight: "100.0 kg",
    height: "2.0 m",
    stats: {
      hp: 80,
      attack: 82,
      defense: 83,
      speed: 80,
    },
    evolutionLine: [
        { name: "Bulbasaur", image: require("../assets/images/Bulbasaur.png") },
        { name: "Ivysaur", image: require("../assets/images/Ivysaur.png") },
        { name: "Venusaur", image: require("../assets/images/Venusaur.png") },
    ],
  },
};

export const getPokemonList = (): Pokemon[] => pokemonListData;

export const getPokemonDetail = (id: number): PokemonDetail | undefined =>
  pokemonDetailsData[id];
