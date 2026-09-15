import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProvider } from '@/store/AppStore';
import { colors } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync().catch(() => {
  /* the splash screen may already be hidden on fast refresh */
});

export default function RootLayout() {
  // Pretendard carries the UI, Inter every numeral — both are design-system
  // requirements, so the app waits for them rather than flashing a fallback.
  const [fontsLoaded, fontError] = useFonts({
    'Pretendard-Regular': require('../assets/fonts/Pretendard-Regular.otf'),
    'Pretendard-Medium': require('../assets/fonts/Pretendard-Medium.otf'),
    'Pretendard-SemiBold': require('../assets/fonts/Pretendard-SemiBold.otf'),
    'Pretendard-Bold': require('../assets/fonts/Pretendard-Bold.otf'),
    Inter_400Regular: require('../assets/fonts/Inter_400Regular.ttf'),
    Inter_500Medium: require('../assets/fonts/Inter_500Medium.ttf'),
    Inter_600SemiBold: require('../assets/fonts/Inter_600SemiBold.ttf'),
    Inter_700Bold: require('../assets/fonts/Inter_700Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.surface },
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen
              name="roleplay/session"
              options={{ animation: 'fade', gestureEnabled: false }}
            />
          </Stack>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
