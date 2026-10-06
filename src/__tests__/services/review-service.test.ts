import { deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';

import { ecouterAvis, enregistrerAvis, supprimerAvis } from '@/services/review-service';
import { supprimerImage, televerserImage } from '@/services/storage-service';

import { creerAvisTest, profilTest } from '../fixtures';

jest.mock('firebase/firestore', () => ({
  collection: jest.fn((_base: unknown, ...segments: string[]) => ({ chemin: segments.join('/') })),
  doc: jest.fn((_base: unknown, ...segments: string[]) => ({ chemin: segments.join('/') })),
  setDoc: jest.fn(async () => undefined),
  deleteDoc: jest.fn(async () => undefined),
  onSnapshot: jest.fn(),
  serverTimestamp: jest.fn(() => 'HORODATAGE_SERVEUR'),
}));

jest.mock('@/services/storage-service', () => ({
  televerserImage: jest.fn(async () => 'https://stockage/avis.jpg'),
  supprimerImage: jest.fn(async () => undefined),
}));

describe('review-service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("enregistre l'avis avec l'identifiant de l'auteur comme identifiant de document", async () => {
    await enregistrerAvis('adresse-9', profilTest, {
      note: 4,
      commentaire: '  Excellent  ',
      photoUri: null,
      photoUrlExistante: null,
    });

    expect(doc).toHaveBeenCalledWith(expect.anything(), 'adresses', 'adresse-9', 'avis', profilTest.id);
    expect(setDoc).toHaveBeenCalledWith(
      { chemin: `adresses/adresse-9/avis/${profilTest.id}` },
      {
        auteurId: profilTest.id,
        auteurNom: profilTest.nom,
        auteurPhotoUrl: null,
        note: 4,
        commentaire: 'Excellent',
        photoUrl: null,
        creeLe: 'HORODATAGE_SERVEUR',
      },
    );
    expect(televerserImage).not.toHaveBeenCalled();
  });

  it('téléverse la nouvelle photo du commentaire', async () => {
    await enregistrerAvis('adresse-9', profilTest, {
      note: 5,
      commentaire: '',
      photoUri: 'file://avis.jpg',
      photoUrlExistante: 'https://ancienne.jpg',
    });

    expect(televerserImage).toHaveBeenCalledWith('file://avis.jpg', 'avis', profilTest.id, 'adresse-9');
    expect(setDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ photoUrl: 'https://stockage/avis.jpg', note: 5 }),
    );
  });

  it('conserve la photo existante lors de la modification', async () => {
    await enregistrerAvis('adresse-9', profilTest, {
      note: 3,
      commentaire: 'Bien',
      photoUri: null,
      photoUrlExistante: 'https://ancienne.jpg',
    });

    expect(setDoc).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ photoUrl: 'https://ancienne.jpg' }));
  });

  it("supprime l'avis et sa photo", async () => {
    const avis = creerAvisTest({ photoUrl: 'https://stockage/avis.jpg' });

    await supprimerAvis('adresse-9', avis);

    expect(deleteDoc).toHaveBeenCalledWith({ chemin: `adresses/adresse-9/avis/${avis.auteurId}` });
    expect(supprimerImage).toHaveBeenCalledWith('https://stockage/avis.jpg');
  });

  it('écoute les avis triés du plus récent au plus ancien', () => {
    const rappel = jest.fn();
    (onSnapshot as jest.Mock).mockImplementation((_reference, surSucces) => {
      surSucces({
        docs: [
          { id: 'a', data: () => ({ auteurId: 'a', note: 2, creeLe: { toDate: () => new Date(2020, 0, 1) } }) },
          { id: 'b', data: () => ({ auteurId: 'b', note: 5, creeLe: { toDate: () => new Date(2026, 0, 1) } }) },
        ],
      });
      return jest.fn();
    });

    ecouterAvis('adresse-9', rappel);

    expect(rappel.mock.calls[0][0].map((avis: { id: string }) => avis.id)).toEqual(['b', 'a']);
    expect(rappel.mock.calls[0][0][1]).toEqual(
      expect.objectContaining({ commentaire: '', photoUrl: null, auteurPhotoUrl: null }),
    );
  });
});
