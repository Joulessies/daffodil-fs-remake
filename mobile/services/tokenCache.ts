import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { TokenCache } from '@clerk/clerk-expo';

export const tokenCache: TokenCache | undefined =
  Platform.OS !== 'web'
    ? {
        async getToken(key: string) {
          try {
            const secureVal = await Promise.race([
              SecureStore.getItemAsync(key),
              new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500)),
            ]);
            if (secureVal) return secureVal;
          } catch {}
          try {
            return await AsyncStorage.getItem(key);
          } catch {
            return null;
          }
        },
        async saveToken(key: string, value: string) {
          try {
            await SecureStore.setItemAsync(key, value);
          } catch {}
          try {
            await AsyncStorage.setItem(key, value);
          } catch {}
        },
      }
    : undefined;

