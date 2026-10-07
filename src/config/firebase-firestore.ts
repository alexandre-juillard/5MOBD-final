import type { FirebaseApp } from 'firebase/app';
import { getFirestore, initializeFirestore, type Firestore } from 'firebase/firestore';

export const initialiserBaseDeDonnees = (application: FirebaseApp): Firestore => {
  try {
    return initializeFirestore(application, { experimentalForceLongPolling: true });
  } catch {
    return getFirestore(application);
  }
};
