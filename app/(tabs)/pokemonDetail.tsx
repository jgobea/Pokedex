// pokemonDetail.tsx
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getPokemonById, Pokemon } from '../../services/pokemonService';

export default function PokemonDetail() {
  const { id } = useLocalSearchParams();
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPokemon = async () => {
      if (id) {
        const pokemonId = typeof id === 'string' ? parseInt(id) : parseInt(id[0]);
        const data = await getPokemonById(pokemonId);
        setPokemon(data);
        setLoading(false);
      }
    };

    fetchPokemon();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#982AEF" />
      </View>
    );
  }

  if (!pokemon) {
    return (
      <View style={styles.container}>
        <Text>Pokémon no encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.name}>{pokemon.name}</Text>
      <Text style={styles.id}>#{pokemon.id}</Text>
      <Image source={{ uri: pokemon.image }} style={styles.image} />
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tipos</Text>
        <View style={styles.typesContainer}>
          {pokemon.types?.map((type, index) => (
            <Text key={index} style={styles.type}>{type}</Text>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estadísticas</Text>
        {pokemon.stats && (
          <>
            <Text>HP: {pokemon.stats.hp}</Text>
            <Text>Ataque: {pokemon.stats.attack}</Text>
            <Text>Defensa: {pokemon.stats.defense}</Text>
            <Text>Ataque Especial: {pokemon.stats.specialAttack}</Text>
            <Text>Defensa Especial: {pokemon.stats.specialDefense}</Text>
            <Text>Velocidad: {pokemon.stats.speed}</Text>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Habilidades</Text>
        {pokemon.abilities?.map((ability, index) => (
          <Text key={index}>{ability}</Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  id: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  typesContainer: {
    flexDirection: 'row',
  },
  type: {
    padding: 5,
    backgroundColor: '#982AEF',
    color: 'white',
    borderRadius: 5,
    marginRight: 5,
    textTransform: 'capitalize',
  },
});