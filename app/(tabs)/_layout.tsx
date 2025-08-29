import { Stack } from "expo-router";

export default function TabLayout() {
  return (
    <Stack initialRouteName="login">
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="menuPokedex" options={{ headerShown: false }} />
      <Stack.Screen name="pokemonDetail" options={{ headerShown: false }} />
      <Stack.Screen name="home" options={{ headerShown: false }} />
    </Stack>
  );
}
