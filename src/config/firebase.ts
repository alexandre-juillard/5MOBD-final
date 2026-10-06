import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

import { initialiserAuthentification } from './firebase-auth';

const configurationFirebase = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'cle-non-configuree',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'projet-non-configure',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const estFirebaseConfigure = Boolean(
  process.env.EXPO_PUBLIC_FIREBASE_API_KEY && process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
);

const application: FirebaseApp = getApps().length ? getApp() : initializeApp(configurationFirebase);

export const authentification = initialiserAuthentification(application);
export const baseDeDonnees = getFirestore(application);
export const stockage = getStorage(application);
