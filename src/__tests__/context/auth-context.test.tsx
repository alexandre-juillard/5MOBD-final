import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { FournisseurAuthentification, useAuthentification } from '@/context/auth-context';
import {
  connecter,
  deconnecter,
  ecouterAuthentification,
  inscrire,
  mettreAJourPhotoProfil,
  recupererProfil,
} from '@/services/auth-service';

jest.mock('@/services/auth-service', () => ({
  connecter: jest.fn(async () => undefined),
  deconnecter: jest.fn(async () => undefined),
  ecouterAuthentification: jest.fn(),
  inscrire: jest.fn(),
  mettreAJourPhotoProfil: jest.fn(async () => 'https://stockage/profil.jpg'),
  recupererProfil: jest.fn(),
}));

const enveloppe = ({ children }: { children: ReactNode }) => <FournisseurAuthentification>{children}</FournisseurAuthentification>;

let rappelAuthentification: (utilisateur: unknown) => Promise<void> | void = () => undefined;

describe('FournisseurAuthentification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (ecouterAuthentification as jest.Mock).mockImplementation((rappel) => {
      rappelAuthentification = rappel;
      return jest.fn();
    });
  });

  it("refuse l'utilisation hors du fournisseur", async () => {
    const erreurConsole = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(renderHook(() => useAuthentification())).rejects.toThrow('useAuthentification doit être utilisé dans un FournisseurAuthentification');
    erreurConsole.mockRestore();
  });

  it("termine le chargement sans utilisateur connecté", async () => {
    const { result } = await renderHook(() => useAuthentification(), { wrapper: enveloppe });
    expect(result.current.chargement).toBe(true);

    await act(async () => rappelAuthentification(null));

    expect(result.current.chargement).toBe(false);
    expect(result.current.utilisateur).toBeNull();
    expect(result.current.profil).toBeNull();
  });

  it("charge le profil de l'utilisateur connecté", async () => {
    (recupererProfil as jest.Mock).mockResolvedValue({ id: 'uid-1', nom: 'Jean', photoUrl: null });
    const { result } = await renderHook(() => useAuthentification(), { wrapper: enveloppe });

    await act(async () => rappelAuthentification({ uid: 'uid-1' }));

    expect(result.current.utilisateur).toEqual({ uid: 'uid-1' });
    expect(result.current.profil).toEqual({ id: 'uid-1', nom: 'Jean', photoUrl: null });
  });

  it("utilise un profil de secours si Firestore est indisponible", async () => {
    (recupererProfil as jest.Mock).mockRejectedValue(new Error('hors ligne'));
    const { result } = await renderHook(() => useAuthentification(), { wrapper: enveloppe });

    await act(async () => rappelAuthentification({ uid: 'uid-1', displayName: 'Jean', photoURL: null }));

    expect(result.current.profil).toEqual({ id: 'uid-1', nom: 'Jean', photoUrl: null });
    expect(result.current.chargement).toBe(false);
  });

  it("n'interroge pas le profil pendant l'inscription", async () => {
    (inscrire as jest.Mock).mockImplementation(async () => {
      await rappelAuthentification({ uid: 'uid-2' });
      return { uid: 'uid-2' };
    });
    const { result } = await renderHook(() => useAuthentification(), { wrapper: enveloppe });

    await act(async () => result.current.sInscrire(' Marie ', 'marie@exemple.fr', 'secret1'));

    expect(recupererProfil).not.toHaveBeenCalled();
    expect(inscrire).toHaveBeenCalledWith(' Marie ', 'marie@exemple.fr', 'secret1');
    expect(result.current.profil).toEqual({ id: 'uid-2', nom: 'Marie', photoUrl: null });
  });

  it('délègue la connexion, la déconnexion et le changement de photo', async () => {
    (recupererProfil as jest.Mock).mockResolvedValue({ id: 'uid-1', nom: 'Jean', photoUrl: null });
    const { result } = await renderHook(() => useAuthentification(), { wrapper: enveloppe });
    await act(async () => rappelAuthentification({ uid: 'uid-1' }));

    await act(async () => result.current.seConnecter('jean@exemple.fr', 'secret1'));
    expect(connecter).toHaveBeenCalledWith('jean@exemple.fr', 'secret1');

    await act(async () => result.current.changerPhotoProfil('file://moi.jpg'));
    expect(mettreAJourPhotoProfil).toHaveBeenCalledWith({ uid: 'uid-1' }, 'file://moi.jpg');
    await waitFor(() => expect(result.current.profil?.photoUrl).toBe('https://stockage/profil.jpg'));

    await act(async () => result.current.seDeconnecter());
    expect(deconnecter).toHaveBeenCalled();
  });
});
