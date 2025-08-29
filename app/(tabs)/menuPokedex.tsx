import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Importar AsyncStorage
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import RadioGroup, { RadioButtonProps } from "react-native-radio-buttons-group";
import {
  getPokemonById,
  getPokemonList,
  getTotalPokemonCount,
  Pokemon,
  searchPokemonByName,
} from "../../services/pokemonService";

type AnimatedValuesType = Record<number, Animated.Value>;

const PAGE_SIZE = 50; // Número de Pokémon por página
const FAVORITES_KEY = "favoritePokemons"; // Clave para almacenar favoritos

export default function App() {
  const router = useRouter();
  const [searchMode, setSearchMode] = useState<string>("name");
  const [searchText, setSearchText] = useState<string>("");
  const [pokemonData, setPokemonData] = useState<Pokemon[]>([]);
  const [filteredPokemonData, setFilteredPokemonData] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searching, setSearching] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPokemon, setTotalPokemon] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<number[]>([]); // Array para almacenar IDs de Pokémon favoritos

  const animatedValues = useRef<AnimatedValuesType>({}).current;
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadInitialData();
    loadFavorites(); // Cargar favoritos al iniciar
  }, []);

  // Cargar favoritos desde AsyncStorage
  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem(FAVORITES_KEY);
      if (storedFavorites !== null) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch {
      console.error("Error loading favorites");
    }
  };

  // Guardar favoritos en AsyncStorage
  const saveFavorites = async (newFavorites: number[]) => {
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
    } catch {
      console.error("Error saving favorites");
    }
  };

  // Alternar Pokémon como favorito
  const toggleFavorite = (pokemonId: number) => {
    const newFavorites = favorites.includes(pokemonId)
      ? favorites.filter((id) => id !== pokemonId) // Remover si ya es favorito
      : [...favorites, pokemonId]; // Agregar si no es favorito

    setFavorites(newFavorites);
    saveFavorites(newFavorites);
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      // Obtener el total de Pokémon disponibles
      const total = await getTotalPokemonCount();
      setTotalPokemon(total);

      // Cargar primera página
      const pokemonList = await getPokemonList(PAGE_SIZE, 0);
      setPokemonData(pokemonList);
      setFilteredPokemonData(pokemonList);

      // Inicializar valores animados
      pokemonList.forEach((pokemon) => {
        animatedValues[pokemon.id] = new Animated.Value(1);
      });

      setError(null);
      setHasMore(pokemonList.length === PAGE_SIZE);
      setCurrentPage(1); // Reiniciar a la primera página
    } catch {
      setError("Error al cargar los Pokémon");
      console.error("Error al cargar los Pokémon");
    } finally {
      setLoading(false);
    }
  };

  const loadMorePokemon = async () => {
    if (loadingMore || !hasMore || searchText !== "") return;

    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      const offset = (nextPage - 1) * PAGE_SIZE;

      const newPokemonList = await getPokemonList(PAGE_SIZE, offset);

      if (newPokemonList.length > 0) {
        // Filtrar Pokémon que ya existen (por si hay duplicados)
        const uniqueNewPokemon = newPokemonList.filter(
          (newPokemon) =>
            !pokemonData.some((existing) => existing.id === newPokemon.id)
        );

        setPokemonData((prev) => [...prev, ...uniqueNewPokemon]);
        setFilteredPokemonData((prev) => [...prev, ...uniqueNewPokemon]);

        // Inicializar valores animados para los nuevos Pokémon
        uniqueNewPokemon.forEach((pokemon) => {
          animatedValues[pokemon.id] = new Animated.Value(1);
        });

        setCurrentPage(nextPage);
        setHasMore(uniqueNewPokemon.length === PAGE_SIZE);
      } else {
        setHasMore(false);
      }
    } catch {
      console.error("Error loading more Pokémon");
    } finally {
      setLoadingMore(false);
    }
  };

  const onRefresh = async () => {
    // Limpiar cualquier búsqueda activa
    setSearchText("");
    setSearching(false);

    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  useEffect(() => {
    const filterPokemon = async () => {
      if (searchText === "") {
        setFilteredPokemonData(pokemonData);
        setSearching(false);
        return;
      }

      setSearching(true);

      if (searchMode === "name") {
        // Siempre buscar directamente en la API cuando se busca por nombre
        try {
          const pokemon = await searchPokemonByName(searchText);
          if (pokemon) {
            setFilteredPokemonData([pokemon]);
            // Agregar a pokemonData solo si no existe
            if (!pokemonData.some((p) => p.id === pokemon.id)) {
              setPokemonData((prev) => [...prev, pokemon]);
              animatedValues[pokemon.id] = new Animated.Value(1);
            }
          } else {
            setFilteredPokemonData([]);
          }
        } catch {
          setFilteredPokemonData([]);
        } finally {
          setSearching(false);
        }
      } else {
        // Búsqueda por número
        const number = parseInt(searchText);
        if (!isNaN(number)) {
          const localResult = pokemonData.filter(
            (pokemon) => pokemon.id === number
          );
          if (localResult.length > 0) {
            setFilteredPokemonData(localResult);
            setSearching(false);
          } else {
            try {
              const pokemon = await getPokemonById(number);
              if (pokemon) {
                setFilteredPokemonData([pokemon]);
                if (!pokemonData.some((p) => p.id === pokemon.id)) {
                  setPokemonData((prev) => [...prev, pokemon]);
                  animatedValues[pokemon.id] = new Animated.Value(1);
                }
              } else {
                setFilteredPokemonData([]);
              }
            } catch {
              setFilteredPokemonData([]);
            } finally {
              setSearching(false);
            }
          }
        } else {
          setFilteredPokemonData([]);
          setSearching(false);
        }
      }
    };

    const timeoutId = setTimeout(() => {
      if (searchText) {
        filterPokemon();
      } else {
        setSearching(false);
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [searchText, searchMode, pokemonData]);

  // Función para detectar cuando el usuario llega al final
  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;

    if (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    ) {
      loadMorePokemon();
    }
  };

  const radioButtons: RadioButtonProps[] = useMemo(
    () => [
      {
        id: "1",
        label: "Por nombre",
        value: "name",
        color: "#982AEF",
        labelStyle: { color: "#fff", fontWeight: "bold" },
      },
      {
        id: "2",
        label: "Por número",
        value: "number",
        color: "#982AEF",
        labelStyle: { color: "#fff", fontWeight: "bold" },
      },
    ],
    []
  );

  const handleInputChange = (text: string) => {
    if (searchMode === "number") {
      const onlyDigits = text.replace(/\D/g, "");
      setSearchText(onlyDigits);
    } else {
      setSearchText(text);
    }
  };

  const handlePressIn = (id: number) => {
    if (animatedValues[id]) {
      Animated.spring(animatedValues[id], {
        toValue: 1.1,
        useNativeDriver: true,
        friction: 4,
        tension: 40,
      }).start();
    }
  };

  const handlePressOut = (id: number) => {
    if (animatedValues[id]) {
      Animated.spring(animatedValues[id], {
        toValue: 1,
        useNativeDriver: true,
        friction: 4,
        tension: 40,
      }).start();
    }
  };

  const goToHome = () => router.push("/home");
  const goToPokemonDetail = (id: number) =>
    router.push({ pathname: "/pokemonDetail", params: { id } });

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerContainer}>
        <ActivityIndicator size="small" color="#982AEF" />
        <Text style={styles.footerText}>Cargando más Pokémon...</Text>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (loading) return null;

    if (searchText) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No se encontraron resultados para {searchText}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No hay Pokémon para mostrar</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <View style={styles.titleLeft}>
            <Image
              source={require("../../assets/images/pokeball.png")}
              style={styles.pokeballImage}
            />
            <Text style={styles.title}>Pokédex</Text>
          </View>
          <TouchableOpacity onPress={goToHome} style={styles.homeButton}>
            <MaterialIcons name="home" size={30} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            Mostrando {filteredPokemonData.length} de {totalPokemon} Pokémon
          </Text>
          <Text style={styles.statsText}>Favoritos: {favorites.length}</Text>
        </View>

        <View style={styles.inputContainer}>
          <Image
            source={require("../../assets/images/search-icon.png")}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.input}
            placeholder={`Buscar Pokémon por ${
              searchMode === "name" ? "nombre" : "número"
            }...`}
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={handleInputChange}
            keyboardType={searchMode === "number" ? "numeric" : "default"}
          />
          {searching && (
            <ActivityIndicator
              size="small"
              color="#982AEF"
              style={styles.searchIndicator}
            />
          )}
        </View>

        <View style={styles.radioWrapper}>
          <RadioGroup
            radioButtons={radioButtons}
            onPress={(selectedId: string) => {
              const selectedButton = radioButtons.find(
                (btn) => btn.id === selectedId
              );
              if (selectedButton) {
                setSearchMode(selectedButton.value as string);
                setSearchText("");
              }
            }}
            layout="row"
            selectedId={searchMode === "name" ? "1" : "2"}
          />
        </View>

        <View style={styles.resultBox}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#982AEF" />
              <Text style={styles.loadingText}>Cargando Pokémon...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                onPress={loadInitialData}
                style={styles.retryButton}
              >
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              ref={scrollViewRef}
              contentContainerStyle={styles.cardRow}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={["#982AEF"]}
                  tintColor="#982AEF"
                />
              }
            >
              {filteredPokemonData.map((pokemon) => (
                <TouchableOpacity
                  key={pokemon.id}
                  activeOpacity={1}
                  onPress={() => goToPokemonDetail(pokemon.id)}
                  onPressIn={() => handlePressIn(pokemon.id)}
                  onPressOut={() => handlePressOut(pokemon.id)}
                  style={styles.touchableCard}
                >
                  <Animated.View
                    style={[
                      styles.card,
                      { transform: [{ scale: animatedValues[pokemon.id] }] },
                    ]}
                  >
                    <Text style={styles.cardNumber}>#{pokemon.id}</Text>

                    {/* Botón de favorito */}
                    <TouchableOpacity
                      style={styles.favoriteButton}
                      onPress={(e) => {
                        e.stopPropagation(); // Evitar que se active el onPress de la tarjeta
                        toggleFavorite(pokemon.id);
                      }}
                    >
                      <MaterialIcons
                        name={
                          favorites.includes(pokemon.id)
                            ? "favorite"
                            : "favorite-border"
                        }
                        size={20}
                        color={
                          favorites.includes(pokemon.id) ? "#FF0000" : "#666"
                        }
                      />
                    </TouchableOpacity>

                    <View style={styles.imageContainer}>
                      <Image
                        source={{ uri: pokemon.image }}
                        style={styles.pokemonImage}
                        resizeMode="contain"
                        onError={(e) =>
                          console.log(
                            "Error loading image:",
                            e.nativeEvent.error
                          )
                        }
                      />
                    </View>
                    <Text style={styles.cardName}>{pokemon.name}</Text>
                    {pokemon.types && (
                      <View style={styles.typesContainer}>
                        {pokemon.types.slice(0, 2).map((type, index) => (
                          <Text key={index} style={styles.typeText}>
                            {type}
                          </Text>
                        ))}
                      </View>
                    )}
                  </Animated.View>
                </TouchableOpacity>
              ))}

              {filteredPokemonData.length === 0 && renderEmptyState()}
              {renderFooter()}
            </ScrollView>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#DC143C",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  titleLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  pokeballImage: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  title: {
    fontSize: 36,
    color: "white",
    fontWeight: "bold",
  },
  homeButton: {
    padding: 8,
    borderRadius: 50,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    tintColor: "#999",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  radioWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  resultBox: {
    flex: 1,
    backgroundColor: "#2E2E2E",
    borderRadius: 20,
    padding: 15,
  },
  resultText: {
    color: "#ccc",
    fontSize: 16,
    textAlign: "center",
  },
  cardRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  touchableCard: {
    width: "30%",
    marginBottom: 10,
  },
  card: {
    aspectRatio: 0.9,
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    position: "relative",
  },
  cardNumber: {
    position: "absolute",
    top: 8,
    right: 10,
    fontSize: 12,
    color: "#666",
    fontWeight: "bold",
  },
  // Estilo para el botón de favorito
  favoriteButton: {
    position: "absolute",
    top: 8,
    left: 10,
    zIndex: 1,
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  pokemonImage: {
    width: 60,
    height: 60,
  },
  cardName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginTop: 5,
  },
  statsContainer: {
    marginBottom: 15,
    alignItems: "center",
  },
  statsText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 5,
  },
  footerContainer: {
    padding: 20,
    alignItems: "center",
    width: "100%",
  },
  footerText: {
    color: "#ccc",
    marginTop: 10,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    width: "100%",
  },
  emptyText: {
    color: "#ccc",
    fontSize: 16,
    textAlign: "center",
  },
  typesContainer: {
    flexDirection: "row",
    marginTop: 5,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  typeText: {
    fontSize: 10,
    color: "#666",
    marginHorizontal: 2,
    textTransform: "capitalize",
  },
  searchIndicator: {
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#982AEF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
