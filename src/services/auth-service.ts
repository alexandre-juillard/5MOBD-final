import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';

import { authentification, baseDeDonnees } from '@/config/firebase';
import type { ProfilUtilisateur } from '@/types/models';

import { televerserImage } from './storage-service';

export const inscrire = async (nom: string, email: string, motDePasse: string): Promise<User> => {
  const { user: utilisateur } = await createUserWithEmailAndPassword(authentification, email.trim(), motDePasse);
  const nomNettoye = nom.trim();
  await updateProfile(utilisateur, { displayName: nomNettoye });
  await setDoc(doc(baseDeDonnees, 'utilisateurs', utilisateur.uid), {
    nom: nomNettoye,
    photoUrl: null,
    creeLe: serverTimestamp(),
  });
  return utilisateur;
};

export const connecter = async (email: string, motDePasse: string): Promise<User> => {
  const { user: utilisateur } = await signInWithEmailAndPassword(authentification, email.trim(), motDePasse);
  return utilisateur;
};

export const deconnecter = (): Promise<void> => signOut(authentification);

export const ecouterAuthentification = (rappel: (utilisateur: User | null) => void): (() => void) =>
  onAuthStateChanged(authentification, rappel);

export const recupererProfil = async (utilisateur: User): Promise<ProfilUtilisateur> => {
  const instantane = await getDoc(doc(baseDeDonnees, 'utilisateurs', utilisateur.uid));
  if (instantane.exists()) {
    const donnees = instantane.data();
    return { id: utilisateur.uid, nom: donnees.nom, photoUrl: donnees.photoUrl ?? null };
  }
  const nom = utilisateur.displayName?.trim() || utilisateur.email?.split('@')[0] || 'Utilisateur';
  const profil = { nom: nom.slice(0, 50).padEnd(2, '_'), photoUrl: null };
  await setDoc(doc(baseDeDonnees, 'utilisateurs', utilisateur.uid), { ...profil, creeLe: serverTimestamp() });
  return { id: utilisateur.uid, ...profil };
};

export const mettreAJourPhotoProfil = async (utilisateur: User, uri: string): Promise<string> => {
  const photoUrl = await televerserImage(uri, 'utilisateurs', utilisateur.uid, 'profil');
  await updateDoc(doc(baseDeDonnees, 'utilisateurs', utilisateur.uid), { photoUrl });
  await updateProfile(utilisateur, { photoURL: photoUrl });
  return photoUrl;
};
