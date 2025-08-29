import { ThemedText } from "@/components/ThemedText";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Importar AsyncStorage
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image as RNImage,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

type FavoritePokemon = {
  id: number;
  name: string;
  image: string;
  types: string[];
};

const FAVORITES_KEY = "favoritePokemons"; // Clave para almacenar favoritos

const typeColors: Record<string, string> = {
  grass: "#63BC5A",
  poison: "#AA6BC8",
  fire: "#FF9D55",
  water: "#5090D6",
  electric: "#F4D23C",
  ghost: "#5269AD",
  normal: "#919AA2",
  fighting: "#CE416B",
  flying: "#89AAE3",
  ground: "#D97845",
  rock: "#C5B78C",
  bug: "#91C12F",
  psychic: "#FA7179",
  ice: "#73CEC0",
  dragon: "#0B6DC3",
  dark: "#5A5465",
  steel: "#5A8EA2",
  fairy: "#EC8FE6",
  default: "#E0306A",
};

export default function HomeProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const isOwnProfile = true;
  const [avatar] = useState("@/assets/images/Ash.jpg");
  const [trainerName, setTrainerName] = useState("");
  const [favorites, setFavorites] = useState<FavoritePokemon[]>([]);

  // Cargar nombre de usuario al iniciar
  useEffect(() => {
    const loadTrainerName = async () => {
      try {
        const name = await AsyncStorage.getItem("trainerName");
        if (name) setTrainerName(name);
      } catch {}
    };
    loadTrainerName();
  }, []);

  // Cargar favoritos al iniciar
  useEffect(() => {
    loadFavorites();
  }, []);

  // Función para cargar favoritos desde AsyncStorage
  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem(FAVORITES_KEY);
      if (storedFavorites !== null) {
        const favoriteIds = JSON.parse(storedFavorites);

        // Obtener información completa de los Pokémon favoritos
        const favoritePokemons = await Promise.all(
          favoriteIds.map(async (id: number) => {
            try {
              // Aquí deberías tener una función para obtener datos de Pokémon por ID
              // Por ahora, usaremos datos básicos
              const response = await fetch(
                `https://pokeapi.co/api/v2/pokemon/${id}`
              );
              const data = await response.json();

              return {
                id: data.id,
                name: data.name,
                image: data.sprites.other["official-artwork"].front_default,
                types: data.types.map((type: any) => type.type.name),
              };
            } catch (error) {
              console.error(`Error loading pokemon ${id}:`, error);
              return null;
            }
          })
        );

        // Filtrar cualquier Pokémon que no se pudo cargar
        const validPokemons = favoritePokemons.filter(
          (pokemon) => pokemon !== null
        ) as FavoritePokemon[];
        setFavorites(validPokemons);
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  // Ya no usamos gradiente, fondo exterior rojo y contenedor interior oscuro.

  const handleChangeAvatar = () =>
    Alert.alert("Cambiar foto", "Implementar selector de imagen");
  const goToPokedex = () => router.push("/menuPokedex");
  const handleLogout = () => router.push("/login");

  return (
    <View style={styles.screenRoot}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.topBrandRow}>
          <View style={styles.brandContainer}>
            <RNImage
              source={require("@/assets/images/Poke_Ball.png")}
              style={styles.brandIcon}
            />
            <ThemedText type="title" style={styles.brandTitle}>
              Pokédex
            </ThemedText>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <MaterialIcons name="logout" size={28} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.innerCard}>
          <View style={styles.profileHeader}>
            <TouchableOpacity
              onPress={isOwnProfile ? handleChangeAvatar : undefined}
              activeOpacity={0.8}
              style={styles.avatarWrapper}
            >
              <RNImage source={{ uri: avatar }} style={styles.avatar} />
              <View style={styles.onlineDot} />
              {isOwnProfile && (
                <View style={styles.changeBadge}>
                  <ThemedText style={styles.changeBadgeTxt}>Foto</ThemedText>
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.identityBlock}>
              <ThemedText type="title" style={styles.titleName}>
                {trainerName}
              </ThemedText>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Favorite Pokémon
            </ThemedText>
            <TouchableOpacity onPress={loadFavorites}>
              <ThemedText type="link">Refresh</ThemedText>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.skeletonRow}>
              {Array.from({ length: 4 }).map((_, i) => (
                <View key={i} style={styles.skeletonCard}>
                  <View style={styles.skelImg} />
                  <View style={styles.skelBar} />
                </View>
              ))}
            </View>
          ) : favorites.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="favorite-border" size={48} color="#666" />
              <ThemedText style={styles.emptyText}>
                No favorite Pokémon yet
              </ThemedText>
              <ThemedText style={styles.emptySubtext}>
                Add some Pokémon to your favorites in the Pokédex
              </ThemedText>
            </View>
          ) : (
            <FlatList
              data={favorites}
              keyExtractor={(item) => String(item.id)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.favList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.favCard}
                  onPress={() =>
                    router.push({
                      pathname: "/pokemonDetail",
                      params: { id: item.id },
                    })
                  }
                >
                  <View style={styles.typeChips}>
                    {item.types.map((t) => (
                      <View
                        key={t}
                        style={[
                          styles.typeChip,
                          {
                            backgroundColor:
                              (typeColors[t] || typeColors.default) + "CC",
                          },
                        ]}
                      >
                        <ThemedText style={styles.typeChipText}>{t}</ThemedText>
                      </View>
                    ))}
                  </View>
                  <Image source={{ uri: item.image }} style={styles.pokeImg} />
                  <ThemedText type="defaultSemiBold" style={styles.pokeName}>
                    {item.name}
                  </ThemedText>
                  <ThemedText style={styles.pokeId}>
                    #{String(item.id).padStart(3, "0")}
                  </ThemedText>
                </TouchableOpacity>
              )}
            />
          )}
          {/* Botón Pokédex */}
          <View style={styles.pokedexButtonWrapper}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.pokedexButton}
              onPress={goToPokedex}
            >
              <View style={styles.pokedexButtonLeft}>
                <MaterialIcons name="search" size={24} color="#FFFFFF" />
                <ThemedText style={styles.pokedexButtonText}>
                  Pokédex
                </ThemedText>
              </View>
              <RNImage
                source={require("@/assets/images/Poke_Ball.png")}
                style={styles.pokedexBall}
              />
            </TouchableOpacity>
          </View>
        </View>
        {/* innerCard */}
      </ScrollView>
    </View>
  );
}

// Componentes auxiliares
const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
    backgroundColor: "#FF1D43",
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  scrollContent: { paddingBottom: 48 },
  innerCard: {
    backgroundColor: "#1F1F23",
    borderRadius: 28,
    paddingBottom: 24,
    paddingTop: 8,
  },
  topBrandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    marginBottom: 4,
  },
  brandContainer: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandIcon: { width: 42, height: 42, resizeMode: "contain" },
  brandTitle: { color: "#FFFFFF" },
  logoutButton: {
    padding: 8,
    borderRadius: 50,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  profileHeader: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  avatarWrapper: { marginRight: 18 },
  avatar: {
    width: 105,
    height: 105,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.6)",
    backgroundColor: "#222",
  },
  onlineDot: {
    position: "absolute",
    bottom: 8,
    right: 10,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#4CAF50",
    borderWidth: 3,
    borderColor: "#121212",
  },
  changeBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  changeBadgeTxt: { fontSize: 10, color: "#FFF" },
  identityBlock: { flex: 1 },
  titleName: { color: "#FFFFFF" },
  handle: { opacity: 0.85, marginTop: 2, fontSize: 13, color: "#FFFFFF" },
  bio: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.9,
    color: "#FFFFFF",
  },
  editBtn: {
    backgroundColor: "rgba(255,255,255,0.22)",
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    marginTop: 12,
  },
  editTxt: { color: "#FFF", fontSize: 13, fontWeight: "600" },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 12,
    marginTop: 14,
  },
  statCard: { alignItems: "center", minWidth: 90 },
  statValue: { fontSize: 20, fontWeight: "700", color: "#FFFFFF" },
  statLabel: { fontSize: 12, opacity: 0.75, color: "#FFFFFF" },
  sectionHeader: {
    marginTop: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: { color: "#FFFFFF" },
  favList: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  favCard: {
    width: 140,
    height: 170,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginRight: 14,
    padding: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  typeChips: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    gap: 4,
    zIndex: 2,
  },
  typeChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  typeChipText: { fontSize: 10, color: "#FFF", textTransform: "capitalize" },
  pokeImg: {
    width: 90,
    height: 90,
    alignSelf: "center",
    marginTop: 10,
  },
  pokeName: {
    textAlign: "center",
    marginTop: 4,
    fontSize: 14,
    color: "#111",
  },
  pokeId: {
    textAlign: "center",
    fontSize: 12,
    opacity: 0.5,
    color: "#111",
  },
  pokedexButtonWrapper: { marginTop: 32, paddingHorizontal: 20 },
  pokedexButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FF1D43",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: "#FFFFFF22",
  },
  pokedexButtonLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  pokedexButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  pokedexBall: { width: 36, height: 36, resizeMode: "contain" },

  // skeletons
  skeletonRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 12,
  },
  skeletonCard: {
    width: 120,
    height: 150,
    backgroundColor: "#2A2A31",
    borderRadius: 18,
    marginRight: 14,
    padding: 10,
  },
  skelImg: {
    flex: 1,
    backgroundColor: "#383840",
    borderRadius: 12,
    marginBottom: 10,
  },
  skelBar: {
    height: 12,
    backgroundColor: "#383840",
    borderRadius: 6,
    width: "70%",
  },

  // Empty state
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginHorizontal: 20,
    backgroundColor: "#2A2A31",
    borderRadius: 20,
    marginTop: 12,
  },
  emptyText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtext: {
    color: "#AAAAAA",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },

  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
  pageBg: { flex: 1 },
});
