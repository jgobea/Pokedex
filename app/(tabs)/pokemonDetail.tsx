import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { getPokemonDetail } from "../../services/pokemonService";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const typeColors: Record<string, string> = {
  grass: "#78C850",
  poison: "#A040A0",
  fire: "#F08030",
  water: "#6890F0",
  electric: "#F8D030",
  ice: "#98D8D8",
  flying: "#A890F0",
  psychic: "#F85888",
  normal: "#A8A878",
  fighting: "#C03028",
  rock: "#B8A038",
  ground: "#E0C068",
  bug: "#A8B820",
  ghost: "#705898",
  steel: "#B8B8D0",
  dragon: "#7038F8",
  dark: "#705848",
  fairy: "#EE99AC",
};

const StatBar = ({ label, value }: { label: string; value: number }) => {
  const barWidth = (value / 200) * 100; // Max stat value assumption
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statBarContainer}>
        <View style={[styles.statBar, { width: `${barWidth}%` }]} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
};

export default function PokemonDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const pokemon = getPokemonDetail(Number(id));

  if (!pokemon) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Pokémon no encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.pokemonName}>{pokemon.name}</Text>
        <Text style={styles.pokemonId}>#{String(pokemon.id).padStart(3, "0")}</Text>
      </View>

      <View style={styles.imageContainer}>
        <Image source={pokemon.image} style={styles.pokemonImage} />
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.typesContainer}>
          {pokemon.types.map((type) => (
            <View
              key={type}
              style={[styles.typeBadge, { backgroundColor: typeColors[type] }]}
            >
              <Text style={styles.typeText}>{type}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Weight</Text>
            <Text style={styles.infoValue}>{pokemon.weight}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Height</Text>
            <Text style={styles.infoValue}>{pokemon.height}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weaknesses</Text>
          <View style={styles.typesContainer}>
            {pokemon.weaknesses.map((type) => (
              <View
                key={type}
                style={[
                  styles.typeBadge,
                  { backgroundColor: typeColors[type] || "#A8A878" },
                ]}
              >
                <Text style={styles.typeText}>{type}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Base Stats</Text>
          <StatBar label="HP" value={pokemon.stats.hp} />
          <StatBar label="Attack" value={pokemon.stats.attack} />
          <StatBar label="Defense" value={pokemon.stats.defense} />
          <StatBar label="Speed" value={pokemon.stats.speed} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Evolution Line</Text>
          <View style={styles.evolutionContainer}>
            {pokemon.evolutionLine.map((evo, index) => (
              <React.Fragment key={evo.name}>
                <View style={styles.evolutionCard}>
                  <Image source={evo.image} style={styles.evolutionImage} />
                  <Text style={styles.evolutionName}>{evo.name}</Text>
                </View>
                {index < pokemon.evolutionLine.length - 1 && (
                  <MaterialIcons
                    name="arrow-forward"
                    size={24}
                    color="#fff"
                    style={styles.arrowIcon}
                  />
                )}
              </React.Fragment>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F1F23",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "#DC143C",
  },
  backButton: {
    padding: 5,
  },
  pokemonName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  pokemonId: {
    fontSize: 18,
    color: "white",
  },
  imageContainer: {
    alignItems: "center",
    marginTop: -50,
  },
  pokemonImage: {
    width: 200,
    height: 200,
  },
  detailsContainer: {
    padding: 20,
  },
  typesContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  typeBadge: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    marginHorizontal: 5,
  },
  typeText: {
    color: "white",
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  infoLabel: {
    fontSize: 16,
    color: "#ccc",
  },
  infoValue: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  statLabel: {
    width: "25%",
    fontSize: 16,
    color: "#ccc",
  },
  statBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: "#444",
    borderRadius: 4,
    marginHorizontal: 10,
  },
  statBar: {
    height: "100%",
    backgroundColor: "#DC143C",
    borderRadius: 4,
  },
  statValue: {
    width: "10%",
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
  evolutionContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  evolutionCard: {
    alignItems: "center",
  },
  evolutionImage: {
    width: 80,
    height: 80,
  },
  evolutionName: {
    color: "white",
    marginTop: 5,
  },
  arrowIcon: {
    opacity: 0.7,
  },
  errorText: {
    color: "white",
    textAlign: "center",
    marginTop: 50,
    fontSize: 18,
  },
});
