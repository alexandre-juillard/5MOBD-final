import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';

import { baseDeDonnees } from '@/config/firebase';
import type { Avis, NouvelAvis, ProfilUtilisateur } from '@/types/models';

import { supprimerImage, televerserImage } from './storage-service';

export const convertirAvis = (instantane: QueryDocumentSnapshot<DocumentData>): Avis => {
  const donnees = instantane.data();
  return {
    id: instantane.id,
    auteurId: donnees.auteurId,
    auteurNom: donnees.auteurNom,
    auteurPhotoUrl: donnees.auteurPhotoUrl ?? null,
    note: donnees.note,
    commentaire: donnees.commentaire ?? '',
    photoUrl: donnees.photoUrl ?? null,
    creeLe: donnees.creeLe?.toDate ? donnees.creeLe.toDate() : null,
  };
};

export const ecouterAvis = (
  adresseId: string,
  rappel: (listeAvis: Avis[]) => void,
  rappelErreur?: (erreur: Error) => void,
): (() => void) =>
  onSnapshot(
    collection(baseDeDonnees, 'adresses', adresseId, 'avis'),
    (resultat) =>
      rappel(
        resultat.docs
          .map(convertirAvis)
          .sort((a, b) => (b.creeLe?.getTime() ?? Date.now()) - (a.creeLe?.getTime() ?? Date.now())),
      ),
    rappelErreur,
  );

export const enregistrerAvis = async (
  adresseId: string,
  profil: ProfilUtilisateur,
  nouvelAvis: NouvelAvis,
): Promise<void> => {
  const photoUrl = nouvelAvis.photoUri
    ? await televerserImage(nouvelAvis.photoUri, 'avis', profil.id, adresseId)
    : nouvelAvis.photoUrlExistante;
  await setDoc(doc(baseDeDonnees, 'adresses', adresseId, 'avis', profil.id), {
    auteurId: profil.id,
    auteurNom: profil.nom,
    auteurPhotoUrl: profil.photoUrl,
    note: Math.round(nouvelAvis.note),
    commentaire: nouvelAvis.commentaire.trim(),
    photoUrl,
    creeLe: serverTimestamp(),
  });
};

export const supprimerAvis = async (adresseId: string, avis: Avis): Promise<void> => {
  await deleteDoc(doc(baseDeDonnees, 'adresses', adresseId, 'avis', avis.auteurId));
  await supprimerImage(avis.photoUrl);
};
