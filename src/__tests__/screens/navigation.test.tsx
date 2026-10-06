import { Text } from 'react-native';
import { renderRouter, screen, waitFor } from 'expo-router/testing-library';

import MiseEnPageOnglets from '@/app/(tabs)/_layout';
import MiseEnPageRacine from '@/app/_layout';
import { ecouterAuthentification, recupererProfil } from '@/services/auth-service';

jest.mock('@/services/auth-service', () => ({
  connecter: jest.fn(),
  deconnecter: jest.fn(),
  ecouterAuthentification: jest.fn(),
  inscrire: jest.fn(),
  mettreAJourPhotoProfil: jest.fn(),
  recupererProfil: jest.fn(),
}));

const creerEcran = (texte: string) =>
  function EcranFactice() {
    return <Text>{texte}</Text>;
  };

const routes = {
  _layout: MiseEnPageRacine,
  '(tabs)/_layout': MiseEnPageOnglets,
  '(tabs)/index': creerEcran('Écran carte'),
  '(tabs)/my-addresses': creerEcran('Écran mes adresses'),
  '(tabs)/explore': creerEcran('Écran explorer'),
  '(tabs)/profile': creerEcran('Écran profil'),
  'address/new': creerEcran('Écran nouvelle adresse'),
  'address/[id]': creerEcran('Écran détail'),
  login: creerEcran('Écran connexion'),
  register: creerEcran('Écran inscription'),
};

const simulerUtilisateur = (utilisateur: { uid: string } | null) => {
  (ecouterAuthentification as jest.Mock).mockImplementation((rappel) => {
    rappel(utilisateur);
    return jest.fn();
  });
};

describe('Navigation protégée', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (recupererProfil as jest.Mock).mockResolvedValue({ id: 'uid-1', nom: 'Jean', photoUrl: null });
  });

  it('redirige un visiteur non connecté vers la connexion', async () => {
    simulerUtilisateur(null);

    const rendu = renderRouter(routes, { initialUrl: '/' });
    await rendu;

    expect(await screen.findByText('Écran connexion')).toBeOnTheScreen();
    expect(rendu.getPathname()).toBe('/login');
    expect(screen.queryByText('Écran carte')).toBeNull();
  });

  it("empêche un visiteur d'ouvrir une adresse", async () => {
    simulerUtilisateur(null);

    await renderRouter(routes, { initialUrl: '/address/abc' });

    expect(await screen.findByText('Écran connexion')).toBeOnTheScreen();
    expect(screen.queryByText('Écran détail')).toBeNull();
  });

  it('affiche la carte à un utilisateur connecté', async () => {
    simulerUtilisateur({ uid: 'uid-1' });

    await renderRouter(routes, { initialUrl: '/' });

    await waitFor(() => expect(screen.getByText('Écran carte')).toBeOnTheScreen());
    expect(screen.getByText('Mes adresses')).toBeOnTheScreen();
    expect(screen.getByText('Explorer')).toBeOnTheScreen();
    expect(screen.getByText('Profil')).toBeOnTheScreen();
  });

  it("renvoie un utilisateur connecté hors de l'écran de connexion", async () => {
    simulerUtilisateur({ uid: 'uid-1' });

    await renderRouter(routes, { initialUrl: '/login' });

    await waitFor(() => expect(screen.queryByText('Écran connexion')).toBeNull());
    expect(screen.getByText('Écran carte')).toBeOnTheScreen();
  });
});
