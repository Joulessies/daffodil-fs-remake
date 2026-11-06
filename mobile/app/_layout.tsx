import '@/services/polyfill';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ClerkProvider } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { initDatabase } from '@/services/database';
import Theme from '@/constants/Theme';

const CLERK_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  'pk_test_c2V0dGxpbmctd2hpcHBldC01OTMwLmNsZXJrLmFjY291bnRzLmRldiQ';

export const unstable_settings = {
  anchor: '(tabs)',
};

// Prevent splash auto-hide with catch to avoid unhandled rejection
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    // Safety timer: Guarantees splash screen is dismissed even if font loading is delayed
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 800);

    if (loaded || error) {
      SplashScreen.hideAsync().catch(() => {});
    }

    return () => clearTimeout(timer);
  }, [loaded, error]);

  useEffect(() => {
    initDatabase().catch((err) => console.warn('DB init error:', err));
  }, []);

  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      tokenCache={tokenCache}
      __experimental_disableNativeClientSync
    >
      <AuthProvider>
        <CartProvider>
          <RootLayoutNav />
        </CartProvider>
      </AuthProvider>
    </ClerkProvider>
  );
}

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Theme.colors.surface,
        },
        headerTintColor: Theme.colors.textPrimary,
        headerTitleStyle: {
          fontWeight: '700',
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: Theme.colors.background,
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
      <Stack.Screen
        name="checkout"
        options={{
          headerShown: true,
          title: 'Checkout & Delivery',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="order-success"
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="modal"
        options={{
          presentation: 'modal',
          title: 'Flower Delivery Guide',
        }}
      />
    </Stack>
  );
}
