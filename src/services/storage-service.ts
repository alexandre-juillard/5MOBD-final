import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { stockage } from '@/config/firebase';

export type DossierImage = 'utilisateurs' | 'adresses' | 'avis';

const largeurMaximale = 1080;

export const compresserImage = async (uri: string): Promise<string> => {
  const contexte = ImageManipulator.manipulate(uri);
  contexte.resize({ width: largeurMaximale });
  const image = await contexte.renderAsync();
  const resultat = await image.saveAsync({ compress: 0.7, format: SaveFormat.JPEG });
  return resultat.uri;
};

export const construireCheminImage = (dossier: DossierImage, utilisateurId: string, nomFichier: string): string =>
  `${dossier}/${utilisateurId}/${nomFichier}.jpg`;

export const lireFichierEnBlob = (uri: string): Promise<Blob> =>
  new Promise((resoudre, rejeter) => {
    const requete = new XMLHttpRequest();
    requete.onload = () => resoudre(requete.response as Blob);
    requete.onerror = () => rejeter(new Error(`Lecture impossible du fichier ${uri}`));
    requete.responseType = 'blob';
    requete.open('GET', uri, true);
    requete.send(null);
  });

export const televerserImage = async (
  uri: string,
  dossier: DossierImage,
  utilisateurId: string,
  nomFichier: string,
): Promise<string> => {
  const uriCompressee = await compresserImage(uri);
  const contenu = await lireFichierEnBlob(uriCompressee);
  const reference = ref(stockage, construireCheminImage(dossier, utilisateurId, nomFichier));
  try {
    await uploadBytes(reference, contenu, { contentType: 'image/jpeg' });
  } finally {
    (contenu as Blob & { close?: () => void }).close?.();
  }
  return getDownloadURL(reference);
};

export const supprimerImage = async (url: string | null): Promise<void> => {
  if (!url) {
    return;
  }
  try {
    await deleteObject(ref(stockage, url));
  } catch {
    return;
  }
};
