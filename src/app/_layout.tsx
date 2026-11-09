import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
  useRouter,
} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Pressable, Text, useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#1E1B4B' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'HRIS Dashboard',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="employee/[id]"
          options={{
            title: 'Kembali ke Daftar Pegawai',
            headerShown: true,
            headerLeft: () => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Kembali ke daftar pegawai."
                onPress={() => {
                  if (router.canGoBack()) {
                    router.back();
                  } else {
                    router.replace('/');
                  }
                }}
                style={{ marginLeft: 7, padding: 4, marginBottom:5 }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 24 }}>‹</Text>
              </Pressable>
            ),
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
