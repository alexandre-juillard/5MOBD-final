import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
  type DocumentSnapshot,
} from 'firebase/firestore';

import { baseDeDonnees } from '@/config/firebase';
import type { Adresse, NouvelleAdresse, ProfilUtilisateur } from '@/types/models';

import { supprimerImage, televerserImage } from './storage-service';

const collectionAdresses = () => collection(baseDeDonnees, 'adresses');

export const convertirAdresse = (
  instantane: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>,
): Adresse => {
  const donnees = instantane.data() ?? {};
  return {
    id: instantane.id,
    proprietaireId: donnees.proprietaireId,
    proprietaireNom: donnees.proprietaireNom,
    nom: donnees.nom,
    description: donnees.description ?? '',
    photoUrl: donnees.photoUrl ?? null,
    adresseTexte: donnees.adresseTexte ?? '',
    latitude: donnees.latitude,
    longitude: donnees.longitude,
    estPublique: Boolean(donnees.estPublique),
    creeLe: donnees.creeLe?.toDate ? donnees.creeLe.toDate() : null,
  };
};

export const trierParDate = (adresses: Adresse[]): Adresse[] =>
  [...adresses].sort((a, b) => (b.creeLe?.getTime() ?? Date.now()) - (a.creeLe?.getTime() ?? Date.now()));

export const creerAdresse = async (profil: ProfilUtilisateur, nouvelleAdresse: NouvelleAdresse): Promise<string> => {
  const reference = doc(collectionAdresses());
  const photoUrl = nouvelleAdresse.photoUri
    ? await televerserImage(nouvelleAdresse.photoUri, 'adresses', profil.id, reference.id)
    : null;
  await setDoc(reference, {
    proprietaireId: profil.id,
    proprietaireNom: profil.nom,
    nom: nouvelleAdresse.nom.trim(),
    description: nouvelleAdresse.description.trim(),
    photoUrl,
    latitude: nouvelleAdresse.latitude,
    longitude: nouvelleAdresse.longitude,
    adresseTexte: nouvelleAdresse.adresseTexte.trim().slice(0, 300),
    estPublique: nouvelleAdresse.estPublique,
    creeLe: serverTimestamp(),
  });
  return reference.id;
};

export const supprimerAdresse = async (adresse: Adresse): Promise<void> => {
  const listeAvis = await getDocs(collection(baseDeDonnees, 'adresses', adresse.id, 'avis'));
  await Promise.all(listeAvis.docs.map((avis) => deleteDoc(avis.ref)));
  await deleteDoc(doc(baseDeDonnees, 'adresses', adresse.id));
  await supprimerImage(adresse.photoUrl);
};

export const recupererAdresse = async (adresseId: string): Promise<Adresse | null> => {
  const instantane = await getDoc(doc(baseDeDonnees, 'adresses', adresseId));
  return instantane.exists() ? convertirAdresse(instantane) : null;
};

export const ecouterMesAdresses = (
  utilisateurId: string,
  rappel: (adresses: Adresse[]) => void,
  rappelErreur?: (erreur: Error) => void,
): (() => void) =>
  onSnapshot(
    query(collectionAdresses(), where('proprietaireId', '==', utilisateurId)),
    (resultat) => rappel(trierParDate(resultat.docs.map(convertirAdresse))),
    rappelErreur,
  );

export const ecouterAdressesPubliques = (
  utilisateurId: string,
  rappel: (adresses: Adresse[]) => void,
  rappelErreur?: (erreur: Error) => void,
): (() => void) =>
  onSnapshot(
    query(collectionAdresses(), where('estPublique', '==', true)),
    (resultat) =>
      rappel(
        trierParDate(
          resultat.docs.map(convertirAdresse).filter((adresse) => adresse.proprietaireId !== utilisateurId),
        ),
      ),
    rappelErreur,
  );
