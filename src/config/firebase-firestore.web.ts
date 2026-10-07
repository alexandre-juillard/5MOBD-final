import type { FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

export const initialiserBaseDeDonnees = (application: FirebaseApp): Firestore => getFirestore(application);
