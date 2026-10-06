import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { getDoc, setDoc, updateDoc } from 'firebase/firestore';

import {
  connecter,
  deconnecter,
  ecouterAuthentification,
  inscrire,
  mettreAJourPhotoProfil,
  recupererProfil,
} from '@/services/auth-service';
import { televerserImage } from '@/services/storage-service';

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(async () => undefined),
  updateProfile: jest.fn(async () => undefined),
  onAuthStateChanged: jest.fn(() => jest.fn()),
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn((_base: unknown, ...segments: string[]) => ({ chemin: segments.join('/') })),
  getDoc: jest.fn(),
  setDoc: jest.fn(async () => undefined),
  updateDoc: jest.fn(async () => undefined),
  serverTimestamp: jest.fn(() => 'HORODATAGE_SERVEUR'),
}));

jest.mock('@/services/storage-service', () => ({
  televerserImage: jest.fn(async () => 'https://stockage/profil.jpg'),
}));

const utilisateurTest = { uid: 'uid-1', email: 'jean@exemple.fr', displayName: 'Jean' };

describe('auth-service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('inscrit un utilisateur et crée son profil', async () => {
    (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({ user: utilisateurTest });

    const utilisateur = await inscrire('  Jean  ', ' jean@exemple.fr ', 'secret1');

    expect(utilisateur).toBe(utilisateurTest);
    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'jean@exemple.fr', 'secret1');
    expect(updateProfile).toHaveBeenCalledWith(utilisateurTest, { displayName: 'Jean' });
    expect(setDoc).toHaveBeenCalledWith(
      { chemin: 'utilisateurs/uid-1' },
      { nom: 'Jean', photoUrl: null, creeLe: 'HORODATAGE_SERVEUR' },
    );
  });

  it("connecte l'utilisateur avec un email nettoyé", async () => {
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({ user: utilisateurTest });

    await expect(connecter(' jean@exemple.fr ', 'secret1')).resolves.toBe(utilisateurTest);
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'jean@exemple.fr', 'secret1');
  });

  it("propage l'erreur de connexion", async () => {
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValue({ code: 'auth/invalid-credential' });

    await expect(connecter('jean@exemple.fr', 'mauvais')).rejects.toEqual({ code: 'auth/invalid-credential' });
  });

  it("déconnecte l'utilisateur", async () => {
    await deconnecter();
    expect(signOut).toHaveBeenCalled();
  });

  it("écoute l'état d'authentification", () => {
    const rappel = jest.fn();
    ecouterAuthentification(rappel);
    expect(onAuthStateChanged).toHaveBeenCalledWith(expect.anything(), rappel);
  });

  it('récupère un profil existant', async () => {
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({ nom: 'Jean', photoUrl: 'https://photo.jpg' }),
    });

    await expect(recupererProfil(utilisateurTest as never)).resolves.toEqual({
      id: 'uid-1',
      nom: 'Jean',
      photoUrl: 'https://photo.jpg',
    });
    expect(setDoc).not.toHaveBeenCalled();
  });

  it("crée le profil manquant à partir des informations d'authentification", async () => {
    (getDoc as jest.Mock).mockResolvedValue({ exists: () => false });

    await expect(recupererProfil({ ...utilisateurTest, displayName: null } as never)).resolves.toEqual({
      id: 'uid-1',
      nom: 'jean',
      photoUrl: null,
    });
    expect(setDoc).toHaveBeenCalledWith(
      { chemin: 'utilisateurs/uid-1' },
      { nom: 'jean', photoUrl: null, creeLe: 'HORODATAGE_SERVEUR' },
    );
  });

  it('met à jour la photo de profil', async () => {
    const url = await mettreAJourPhotoProfil(utilisateurTest as never, 'file://moi.jpg');

    expect(url).toBe('https://stockage/profil.jpg');
    expect(televerserImage).toHaveBeenCalledWith('file://moi.jpg', 'utilisateurs', 'uid-1', 'profil');
    expect(updateDoc).toHaveBeenCalledWith({ chemin: 'utilisateurs/uid-1' }, { photoUrl: 'https://stockage/profil.jpg' });
    expect(updateProfile).toHaveBeenCalledWith(utilisateurTest, { photoURL: 'https://stockage/profil.jpg' });
  });
});
