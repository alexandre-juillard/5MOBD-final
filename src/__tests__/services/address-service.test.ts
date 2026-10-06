import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  where,
} from 'firebase/firestore';

import {
  convertirAdresse,
  creerAdresse,
  ecouterAdressesPubliques,
  ecouterMesAdresses,
  recupererAdresse,
  supprimerAdresse,
} from '@/services/address-service';
import { supprimerImage, televerserImage } from '@/services/storage-service';

import { creerAdresseTest, profilTest } from '../fixtures';

jest.mock('firebase/firestore', () => ({
  collection: jest.fn((_base: unknown, ...segments: string[]) => ({ chemin: segments.join('/') })),
  doc: jest.fn((base: { chemin?: string }, ...segments: string[]) =>
    segments.length
      ? { id: segments[segments.length - 1], chemin: segments.join('/') }
      : { id: 'nouvel-id', chemin: `${base.chemin}/nouvel-id` },
  ),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  setDoc: jest.fn(async () => undefined),
  deleteDoc: jest.fn(async () => undefined),
  onSnapshot: jest.fn(),
  query: jest.fn((...elements: unknown[]) => ({ elements })),
  where: jest.fn((champ: string, operateur: string, valeur: unknown) => ({ champ, operateur, valeur })),
  serverTimestamp: jest.fn(() => 'HORODATAGE_SERVEUR'),
}));

jest.mock('@/services/storage-service', () => ({
  televerserImage: jest.fn(async () => 'https://stockage/photo.jpg'),
  supprimerImage: jest.fn(async () => undefined),
}));

const creerInstantane = (id: string, donnees: Record<string, unknown>) => ({
  id,
  data: () => donnees,
  exists: () => true,
});

describe('address-service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('creerAdresse', () => {
    const nouvelleAdresse = {
      nom: '  Chez Paul  ',
      description: ' Super bistrot ',
      adresseTexte: '1 rue de Paris',
      estPublique: true,
      latitude: 48.85,
      longitude: 2.35,
      photoUri: null,
    };

    it('enregistre une adresse sans photo avec des données nettoyées', async () => {
      const identifiant = await creerAdresse(profilTest, nouvelleAdresse);

      expect(identifiant).toBe('nouvel-id');
      expect(televerserImage).not.toHaveBeenCalled();
      expect(setDoc).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'nouvel-id' }),
        {
          proprietaireId: profilTest.id,
          proprietaireNom: profilTest.nom,
          nom: 'Chez Paul',
          description: 'Super bistrot',
          photoUrl: null,
          latitude: 48.85,
          longitude: 2.35,
          adresseTexte: '1 rue de Paris',
          estPublique: true,
          creeLe: 'HORODATAGE_SERVEUR',
        },
      );
    });

    it("téléverse la photo dans le dossier de l'utilisateur avant l'enregistrement", async () => {
      await creerAdresse(profilTest, { ...nouvelleAdresse, photoUri: 'file://photo.jpg' });

      expect(televerserImage).toHaveBeenCalledWith('file://photo.jpg', 'adresses', profilTest.id, 'nouvel-id');
      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ photoUrl: 'https://stockage/photo.jpg' }),
      );
    });
  });

  it('supprime les avis, puis l’adresse, puis sa photo', async () => {
    const referencesAvis = [{ chemin: 'avis/1' }, { chemin: 'avis/2' }];
    (getDocs as jest.Mock).mockResolvedValue({ docs: referencesAvis.map((ref) => ({ ref })) });
    const adresse = creerAdresseTest({ photoUrl: 'https://stockage/a.jpg' });

    await supprimerAdresse(adresse);

    expect(collection).toHaveBeenCalledWith(expect.anything(), 'adresses', adresse.id, 'avis');
    expect(deleteDoc).toHaveBeenNthCalledWith(1, referencesAvis[0]);
    expect(deleteDoc).toHaveBeenNthCalledWith(2, referencesAvis[1]);
    expect(deleteDoc).toHaveBeenNthCalledWith(3, expect.objectContaining({ chemin: `adresses/${adresse.id}` }));
    expect(supprimerImage).toHaveBeenCalledWith('https://stockage/a.jpg');
  });

  it('convertit un document Firestore en adresse', () => {
    const date = new Date(2026, 1, 1);
    const adresse = convertirAdresse(
      creerInstantane('x', {
        proprietaireId: 'u',
        proprietaireNom: 'Jean',
        nom: 'Lieu',
        latitude: 1,
        longitude: 2,
        estPublique: 1,
        creeLe: { toDate: () => date },
      }) as never,
    );

    expect(adresse).toEqual({
      id: 'x',
      proprietaireId: 'u',
      proprietaireNom: 'Jean',
      nom: 'Lieu',
      description: '',
      photoUrl: null,
      adresseTexte: '',
      latitude: 1,
      longitude: 2,
      estPublique: true,
      creeLe: date,
    });
  });

  it('retourne null pour une adresse inexistante', async () => {
    (getDoc as jest.Mock).mockResolvedValue({ exists: () => false });
    await expect(recupererAdresse('inconnue')).resolves.toBeNull();
  });

  it("n'écoute que les adresses du propriétaire", () => {
    const rappel = jest.fn();
    (onSnapshot as jest.Mock).mockImplementation((_requete, surSucces) => {
      surSucces({
        docs: [
          creerInstantane('ancienne', { nom: 'A', creeLe: { toDate: () => new Date(2020, 0, 1) } }),
          creerInstantane('recente', { nom: 'B', creeLe: { toDate: () => new Date(2026, 0, 1) } }),
        ],
      });
      return jest.fn();
    });

    ecouterMesAdresses('utilisateur-1', rappel);

    expect(where).toHaveBeenCalledWith('proprietaireId', '==', 'utilisateur-1');
    expect(rappel.mock.calls[0][0].map((adresse: { id: string }) => adresse.id)).toEqual(['recente', 'ancienne']);
  });

  it("écoute les adresses publiques en excluant celles de l'utilisateur", () => {
    const rappel = jest.fn();
    (onSnapshot as jest.Mock).mockImplementation((_requete, surSucces) => {
      surSucces({
        docs: [
          creerInstantane('a-moi', { proprietaireId: 'utilisateur-1', estPublique: true }),
          creerInstantane('autre', { proprietaireId: 'utilisateur-2', estPublique: true }),
        ],
      });
      return jest.fn();
    });

    ecouterAdressesPubliques('utilisateur-1', rappel);

    expect(where).toHaveBeenCalledWith('estPublique', '==', true);
    expect(query).toHaveBeenCalled();
    expect(rappel.mock.calls[0][0].map((adresse: { id: string }) => adresse.id)).toEqual(['autre']);
  });

  it('crée une référence de document avant le téléversement', async () => {
    await creerAdresse(profilTest, {
      nom: 'Lieu',
      description: '',
      adresseTexte: '',
      estPublique: false,
      latitude: 0,
      longitude: 0,
      photoUri: null,
    });
    expect(doc).toHaveBeenCalledWith(expect.objectContaining({ chemin: 'adresses' }));
  });
});
