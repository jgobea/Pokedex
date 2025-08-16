import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import RadioGroup, { RadioButtonProps } from "react-native-radio-buttons-group";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { getPokemonList, Pokemon } from "../../services/pokemonService";

type AnimatedValuesType = Record<number, Animated.Value>;

export default function App() {
  const router = useRouter();
  const [searchMode, setSearchMode] = useState<string>("name");
  const [searchText, setSearchText] = useState<string>("");
  const [pokemonData, setPokemonData] = useState<Pokemon[]>([]);
  const [filteredPokemonData, setFilteredPokemonData] =
    useState<Pokemon[]>([]);

  const animatedValues = useRef<AnimatedValuesType>({}).current;

  useEffect(() => {
    const pokemonList = getPokemonList();
    setPokemonData(pokemonList);
    setFilteredPokemonData(pokemonList);
    pokemonList.forEach(pokemon => {
      animatedValues[pokemon.id] = new Animated.Value(1);
    });
  }, []);

  useEffect(() => {
    const filterPokemon = () => {
      let filtered: Pokemon[] = [];
      if (searchMode === "name") {
        filtered = pokemonData.filter((pokemon) =>
          pokemon.name.toLowerCase().includes(searchText.toLowerCase())
        );
      } else {
        if (searchText === "") {
          filtered = pokemonData;
        } else {
          const number = parseInt(searchText);
          if (!isNaN(number)) {
            filtered = pokemonData.filter((pokemon) => pokemon.id === number);
          }
        }
      }
      setFilteredPokemonData(filtered);
    };

    filterPokemon();
  }, [searchText, searchMode, pokemonData]);

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

  const goToHome = () => router.push('/home');
  const goToPokemonDetail = (id: number) => router.push({ pathname: "/pokemonDetail", params: { id } });

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
        </View>

        <View style={styles.radioWrapper}>
          <RadioGroup
            radioButtons={radioButtons}
            onPress={(selectedId: string) => {
              const selectedButton = radioButtons.find(
                (btn) => btn.id === selectedId
              );
              if (selectedButton) setSearchMode(selectedButton.value as string);
            }}
            layout="row"
            // Se ha añadido la propiedad selectedId
            selectedId={searchMode === "name" ? "1" : "2"}
          />
        </View>

        <View style={styles.resultBox}>
          <ScrollView contentContainerStyle={styles.cardRow}>
            {filteredPokemonData.length > 0 ? (
              filteredPokemonData.map((pokemon) => (
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
                    <View style={styles.imageContainer}>
                      <Image
                        source={pokemon.image}
                        style={styles.pokemonImage}
                        resizeMode="contain"
                      />
                    </View>
                    <Text style={styles.cardName}>{pokemon.name}</Text>
                  </Animated.View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.resultText}>
                No se encontraron resultados.
              </Text>
            )}
          </ScrollView>
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
    paddingTop: Platform.OS === "android" ? 60 : 0,
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
    backgroundColor: 'rgba(0,0,0,0.2)',
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
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
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
});
