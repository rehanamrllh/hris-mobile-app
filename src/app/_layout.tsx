import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
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
            title: 'Detail Pegawai',
            headerShown: true,
            headerBackTitle: 'Kembali',
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
