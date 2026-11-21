import { Stack } from "expo-router";
import { Alert, Pressable, Text } from "react-native";

import { useAuth } from "@/context/AuthContext";

export default function AppLayout() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    const result = await signOut();
    if (result.error) Alert.alert("Gagal keluar", result.error);
  };

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#1E1B4B" },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: { fontWeight: "700" },
        headerRight: () => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Keluar dari aplikasi"
            onPress={handleSignOut}
            style={{ marginRight: 12, paddingHorizontal: 10, paddingVertical: 6 }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>Keluar</Text>
          </Pressable>
        ),
      }}
    >
      <Stack.Screen name="index" options={{ title: "HRIS Dashboard", headerShown: true }} />
      <Stack.Screen name="employee/[id]" options={{ title: "Detail Pegawai" }} />
      <Stack.Screen name="leave" options={{ title: "Pengajuan Cuti" }} />
    </Stack>
  );
}
