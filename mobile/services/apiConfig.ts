import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_CUSTOM_URL_KEY = '@daffodil_custom_api_url';
export const LAN_DEFAULT_IP = '192.168.1.4';

export function getApiBaseUrl(): string {
  if (
    process.env.EXPO_PUBLIC_API_URL &&
    !process.env.EXPO_PUBLIC_API_URL.includes('localhost')
  ) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location?.origin) {
      return window.location.origin.replace(/:[0-9]+$/, ':3000');
    }
    return 'http://localhost:3000';
  }

  if (Platform.OS === 'android' && !(Constants as any).isDevice) {
    return 'http://10.0.2.2:3000';
  }

  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any)?.manifest?.debuggerHost ||
    (Constants as any)?.manifest2?.extra?.expoClient?.hostUri;

  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:3000`;
    }
  }

  return `http://${LAN_DEFAULT_IP}:3000`;
}

export async function setCustomApiUrl(url: string): Promise<void> {
  await AsyncStorage.setItem(API_CUSTOM_URL_KEY, url.trim());
}

export async function getCustomApiUrl(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(API_CUSTOM_URL_KEY);
  } catch {
    return null;
  }
}
