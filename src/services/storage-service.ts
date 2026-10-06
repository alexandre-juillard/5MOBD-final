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

export const televerserImage = async (
  uri: string,
  dossier: DossierImage,
  utilisateurId: string,
  nomFichier: string,
): Promise<string> => {
  const uriCompressee = await compresserImage(uri);
  const reponse = await fetch(uriCompressee);
  const contenu = await reponse.blob();
  const reference = ref(stockage, construireCheminImage(dossier, utilisateurId, nomFichier));
  await uploadBytes(reference, contenu, { contentType: 'image/jpeg' });
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
