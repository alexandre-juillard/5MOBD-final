import type { FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

export const initialiserAuthentification = (application: FirebaseApp): Auth => getAuth(application);
