import { ImageManipulator } from 'expo-image-manipulator';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { construireCheminImage, supprimerImage, televerserImage } from '@/services/storage-service';

jest.mock('firebase/storage', () => ({
  ref: jest.fn((_stockage: unknown, chemin: string) => ({ chemin })),
  uploadBytes: jest.fn(async () => undefined),
  getDownloadURL: jest.fn(async () => 'https://stockage/image.jpg'),
  deleteObject: jest.fn(async () => undefined),
}));

describe('storage-service', () => {
  const fetchOriginal = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn(async () => ({ blob: async () => 'CONTENU_BINAIRE' })) as unknown as typeof fetch;
  });

  afterAll(() => {
    global.fetch = fetchOriginal;
  });

  it("construit un chemin rangé par dossier et par utilisateur", () => {
    expect(construireCheminImage('adresses', 'uid-1', 'abc')).toBe('adresses/uid-1/abc.jpg');
  });

  it("compresse puis téléverse l'image au format JPEG", async () => {
    const url = await televerserImage('file://origine.png', 'avis', 'uid-1', 'adresse-1');

    expect(ImageManipulator.manipulate).toHaveBeenCalledWith('file://origine.png');
    expect(global.fetch).toHaveBeenCalledWith('file://compressee.jpg');
    expect(ref).toHaveBeenCalledWith(expect.anything(), 'avis/uid-1/adresse-1.jpg');
    expect(uploadBytes).toHaveBeenCalledWith({ chemin: 'avis/uid-1/adresse-1.jpg' }, 'CONTENU_BINAIRE', {
      contentType: 'image/jpeg',
    });
    expect(getDownloadURL).toHaveBeenCalled();
    expect(url).toBe('https://stockage/image.jpg');
  });

  it("ne fait rien sans URL à supprimer", async () => {
    await supprimerImage(null);
    expect(deleteObject).not.toHaveBeenCalled();
  });

  it("supprime l'image et ignore les erreurs", async () => {
    (deleteObject as jest.Mock).mockRejectedValueOnce(new Error('introuvable'));

    await expect(supprimerImage('https://stockage/image.jpg')).resolves.toBeUndefined();
    expect(ref).toHaveBeenCalledWith(expect.anything(), 'https://stockage/image.jpg');
  });
});
