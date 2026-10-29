import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '@/services/supabase';
import Theme from '@/constants/Theme';

export default function AuthCallback() {
  const router = useRouter();
  const url = Linking.useURL();

  useEffect(() => {
    let isMounted = true;

    const handleAuth = async () => {
      try {
        const rawUrl = url || (await Linking.getInitialURL());

        if (rawUrl) {
          // 1. Check hash fragments (#access_token=...&refresh_token=...)
          const hashIndex = rawUrl.indexOf('#');
          if (hashIndex !== -1) {
            const hash = rawUrl.substring(hashIndex + 1);
            const params = new URLSearchParams(hash);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');

            if (accessToken && refreshToken) {
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
              if (isMounted) router.replace('/(tabs)/profile' as any);
              return;
            }
          }

          // 2. Check query parameters (?code=... or ?access_token=...)
          const queryIndex = rawUrl.indexOf('?');
          if (queryIndex !== -1) {
            const query = rawUrl.substring(queryIndex + 1);
            const params = new URLSearchParams(query);
            const code = params.get('code');
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');

            if (accessToken && refreshToken) {
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
              if (isMounted) router.replace('/(tabs)/profile' as any);
              return;
            }

            if (code) {
              await supabase.auth.exchangeCodeForSession(code);
              if (isMounted) router.replace('/(tabs)/profile' as any);
              return;
            }
          }
        }

        // 3. Fallback: check if session already set
        const { data: { session } } = await supabase.auth.getSession();
        if (session && isMounted) {
          router.replace('/(tabs)/profile' as any);
          return;
        }
      } catch (e) {
        console.error('Error handling auth callback:', e);
      }

      if (isMounted) {
        router.replace('/(tabs)/profile' as any);
      }
    };

    handleAuth();

    return () => {
      isMounted = false;
    };
  }, [url]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Theme.colors.primary} />
      <Text style={styles.text}>Connecting your account to Daffodil Atelier...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
    gap: 16,
    padding: 24,
  },
  text: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
});
