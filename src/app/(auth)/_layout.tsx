import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#1E1B4B" },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: { fontWeight: "700" },
      }}
    >
      <Stack.Screen name="sign-in" options={{ title: "Masuk" }} />
      <Stack.Screen name="sign-up" options={{ title: "Daftar" }} />
    </Stack>
  );
}
