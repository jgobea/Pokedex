import { NavigationContainer } from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
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
import { useRouter } from "expo-router";

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
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");

  const handleLogin = () => {
    if (usuario === "Ash" && contrasena === "Pikachu") {
      Alert.alert("¡Éxito!", "Bienvenido a tu Pokédex, entrenador!");
      router.push("/home");
    } else {
      Alert.alert("Error", "Usuario o contraseña incorrectos.");
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
            value={usuario}
            onChangeText={setUsuario}
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
  const [usuario, setUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");

  const handleRegistro = () => {
    if (usuario && email && contrasena) {
      Alert.alert("¡Registro exitoso!", `Usuario ${usuario} creado`);
      navigation.goBack();
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
            value={usuario}
            onChangeText={setUsuario}
          />
          <TextInput
            placeholder="Correo electrónico"
            placeholderTextColor="#ffffffff"
            style={styles.inputFixed}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
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
