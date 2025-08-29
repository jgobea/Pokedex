import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Importa la imagen desde assets

type RootStackParamList = {
  Login: undefined;
  Registro: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

type LoginProps = NativeStackScreenProps<RootStackParamList, "Login">;

// Pantalla de Login
function LoginScreen({ navigation }: LoginProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [contrasena, setContrasena] = useState("");

  const handleLogin = async () => {
    if (!name || !contrasena) {
      Alert.alert("Error", "Debes completar todos los campos.");
      return;
    }
    try {
      const response = await fetch("http://192.168.1.104:3001/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `query($name: String!) { user(name: $name) { name password } }`,
          variables: { name },
        }),
      });
      const result = await response.json();
      const user = result.data?.user;
      if (user && user.password === contrasena) {
        // Guardar el nombre de usuario en AsyncStorage
        try {
          const AsyncStorage = (
            await import("@react-native-async-storage/async-storage")
          ).default;
          await AsyncStorage.setItem("trainerName", name);
        } catch {
          /* ignore */
        }
        Alert.alert("¡Éxito!", "Bienvenido a tu Pokédex, entrenador!");
        router.push("/home");
      } else {
        Alert.alert("Error", "Usuario o contraseña incorrectos.");
      }
    } catch {
      Alert.alert("Error", "No se pudo conectar con el servidor.");
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/rotom.jpg")}
      style={styles.background}
      resizeMode="contain"
    >
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.centerContainer}>
          <Text style={styles.titulo}>Pokédex</Text>
          <TextInput
            placeholder="Nombre de entrenador"
            placeholderTextColor="#ffffffff"
            style={styles.inputFixed}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            placeholder="Contraseña de entrenador"
            placeholderTextColor="#ffffffff"
            secureTextEntry
            style={styles.inputFixed}
            value={contrasena}
            onChangeText={setContrasena}
          />
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.buttonText}>Iniciar Sesión</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Registro")}>
            <Text style={styles.link}>Regístrate</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

type RegistroProps = NativeStackScreenProps<RootStackParamList, "Registro">;

// Pantalla de Registro
function RegistroScreen({ navigation }: RegistroProps) {
  const [name, setName] = useState("");
  const [contrasena, setContrasena] = useState("");

  const handleRegistro = async () => {
    if (name && contrasena) {
      try {
        const response = await fetch("http://192.168.1.104:3001/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `mutation($name: String!, $password: String!) { register(name: $name, password: $password) { name } }`,
            variables: { name, password: contrasena },
          }),
        });
        const data = await response.json();
        if (data.data && data.data.register) {
          Alert.alert("¡Registro exitoso!", `Usuario ${name} creado`);
          navigation.goBack();
        } else {
          Alert.alert(
            "Error",
            (data.errors && data.errors[0]?.message) ||
              "No se pudo registrar el usuario."
          );
        }
      } catch {
        Alert.alert("Error", "No se pudo conectar con el servidor.");
      }
    } else {
      Alert.alert("Error", "Debes completar todos los campos.");
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/rotom.jpg")}
      style={styles.background}
      resizeMode="contain"
    >
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.centerContainer}>
          <Text style={styles.titulo}>Pokédex</Text>
          <TextInput
            placeholder="Nombre de entrenador"
            placeholderTextColor="#ffffffff"
            style={styles.inputFixed}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            placeholder="Contraseña de entrenador"
            placeholderTextColor="#ffffffff"
            secureTextEntry
            style={styles.inputFixed}
            value={contrasena}
            onChangeText={setContrasena}
          />
          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegistro}
          >
            <Text style={styles.buttonText}>Registrarse</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

// Componente principal
export default function App() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Registro"
        component={RegistroScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// Estilos
const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  centerContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  titulo: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFCB05",
    textShadowColor: "#000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    marginBottom: 20,
  },
  inputFixed: {
    width: 300, // ancho fijo
    height: 50, // alto fijo
    borderColor: "#b11b1bff", // borde rojo
    borderWidth: 2,
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    fontWeight: "bold",
    color: "#000", // texto negro
    backgroundColor: "rgba(255, 255, 255, 0.24)", // fondo blanco translúcido
  },
  loginButton: {
    width: 300,
    backgroundColor: "#FF0000",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 10,
  },
  registerButton: {
    width: 300,
    backgroundColor: "#FF0000",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#fff",
  },
  link: {
    marginTop: 10,
    color: "#FFCB05",
    fontWeight: "bold",
    fontSize: 16,
  },
});
