import { ImageManipulator } from 'expo-image-manipulator';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { construireCheminImage, lireFichierEnBlob, supprimerImage, televerserImage } from '@/services/storage-service';

jest.mock('firebase/storage', () => ({
  ref: jest.fn((_stockage: unknown, chemin: string) => ({ chemin })),
  uploadBytes: jest.fn(async () => undefined),
  getDownloadURL: jest.fn(async () => 'https://stockage/image.jpg'),
  deleteObject: jest.fn(async () => undefined),
}));

type RequeteSimulee = {
  responseType: string;
  response: unknown;
  methode?: string;
  url?: string;
  onload: (() => void) | null;
  onerror: (() => void) | null;
  open: (methode: string, url: string) => void;
  send: () => void;
};

describe('storage-service', () => {
  const xhrOriginal = global.XMLHttpRequest;
  const fermerBlob = jest.fn();
  const blobSimule = { size: 7700, close: fermerBlob };
  let requetes: RequeteSimulee[] = [];
  let echecLecture = false;

  beforeEach(() => {
    jest.clearAllMocks();
    requetes = [];
    echecLecture = false;
    global.XMLHttpRequest = jest.fn(() => {
      const requete: RequeteSimulee = {
        responseType: '',
        response: null,
        onload: null,
        onerror: null,
        open(methode, url) {
          requete.methode = methode;
          requete.url = url;
        },
        send() {
          if (echecLecture) {
            requete.onerror?.();
            return;
          }
          requete.response = blobSimule;
          requete.onload?.();
        },
      };
      requetes.push(requete);
      return requete;
    }) as unknown as typeof XMLHttpRequest;
  });

  afterAll(() => {
    global.XMLHttpRequest = xhrOriginal;
  });

  it('construit un chemin rangé par dossier et par utilisateur', () => {
    expect(construireCheminImage('adresses', 'uid-1', 'abc')).toBe('adresses/uid-1/abc.jpg');
  });

  it('lit le fichier local en Blob via XMLHttpRequest', async () => {
    await expect(lireFichierEnBlob('file://photo.jpg')).resolves.toBe(blobSimule);
    expect(requetes[0]).toEqual(expect.objectContaining({ responseType: 'blob', methode: 'GET', url: 'file://photo.jpg' }));
  });

  it('rejette si le fichier est illisible', async () => {
    echecLecture = true;
    await expect(lireFichierEnBlob('file://absent.jpg')).rejects.toThrow('Lecture impossible du fichier file://absent.jpg');
  });

  it("compresse puis téléverse le contenu réel de l'image au format JPEG", async () => {
    const url = await televerserImage('file://origine.png', 'avis', 'uid-1', 'adresse-1');

    expect(ImageManipulator.manipulate).toHaveBeenCalledWith('file://origine.png');
    expect(requetes[0].url).toBe('file://compressee.jpg');
    expect(ref).toHaveBeenCalledWith(expect.anything(), 'avis/uid-1/adresse-1.jpg');
    expect(uploadBytes).toHaveBeenCalledWith({ chemin: 'avis/uid-1/adresse-1.jpg' }, blobSimule, {
      contentType: 'image/jpeg',
    });
    expect(fermerBlob).toHaveBeenCalled();
    expect(getDownloadURL).toHaveBeenCalled();
    expect(url).toBe('https://stockage/image.jpg');
  });

  it("libère le Blob même si l'envoi échoue", async () => {
    (uploadBytes as jest.Mock).mockRejectedValueOnce({ code: 'storage/unauthorized' });

    await expect(televerserImage('file://origine.png', 'avis', 'uid-1', 'adresse-1')).rejects.toEqual({
      code: 'storage/unauthorized',
    });
    expect(fermerBlob).toHaveBeenCalled();
    expect(getDownloadURL).not.toHaveBeenCalled();
  });

  it('ne fait rien sans URL à supprimer', async () => {
    await supprimerImage(null);
    expect(deleteObject).not.toHaveBeenCalled();
  });

  it("supprime l'image et ignore les erreurs", async () => {
    (deleteObject as jest.Mock).mockRejectedValueOnce(new Error('introuvable'));

    await expect(supprimerImage('https://stockage/image.jpg')).resolves.toBeUndefined();
    expect(ref).toHaveBeenCalledWith(expect.anything(), 'https://stockage/image.jpg');
  });
});
