import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FirebaseApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth, type Auth } from 'firebase/auth';

export const initialiserAuthentification = (application: FirebaseApp): Auth => {
  try {
    return initializeAuth(application, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return getAuth(application);
  }
};
