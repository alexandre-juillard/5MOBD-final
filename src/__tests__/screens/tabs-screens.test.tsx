import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import EcranExplorer from '@/app/(tabs)/explore';
import EcranCarte from '@/app/(tabs)/index';
import EcranMesAdresses from '@/app/(tabs)/my-addresses';
import EcranProfil from '@/app/(tabs)/profile';
import { useAuthentification } from '@/context/auth-context';
import { useAdressesPubliques, useMesAdresses } from '@/hooks/use-addresses';
import { confirmer } from '@/utils/dialogs';
import { choisirImage } from '@/utils/image-picker';

import { creerAdresseTest, profilTest } from '../fixtures';

const mockRouteur = { push: jest.fn(), back: jest.fn() };

jest.mock('expo-router', () => ({ useRouter: () => mockRouteur }));
jest.mock('@/context/auth-context', () => ({ useAuthentification: jest.fn() }));
jest.mock('@/hooks/use-addresses', () => ({ useMesAdresses: jest.fn(), useAdressesPubliques: jest.fn() }));
jest.mock('@/utils/image-picker', () => ({ choisirImage: jest.fn() }));
jest.mock('@/utils/dialogs', () => ({ informer: jest.fn(), confirmer: jest.fn() }));

const mesAdresses = [
  creerAdresseTest({ id: 'publique', nom: 'Boulangerie', estPublique: true }),
  creerAdresseTest({ id: 'privee', nom: 'Coin secret', estPublique: false }),
];

const adressesPubliques = [
  creerAdresseTest({ id: 'p1', nom: 'Musée du Louvre', proprietaireId: 'autre', proprietaireNom: 'Marie' }),
  creerAdresseTest({ id: 'p2', nom: 'Jardin', proprietaireId: 'autre', proprietaireNom: 'Paul' }),
];

const seDeconnecter = jest.fn();
const changerPhotoProfil = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useMesAdresses as jest.Mock).mockReturnValue({ adresses: mesAdresses, chargement: false, erreur: null });
  (useAdressesPubliques as jest.Mock).mockReturnValue({ adresses: adressesPubliques, chargement: false, erreur: null });
  (useAuthentification as jest.Mock).mockReturnValue({
    utilisateur: { uid: profilTest.id, email: 'jean@exemple.fr' },
    profil: profilTest,
    seDeconnecter,
    changerPhotoProfil,
  });
});

describe('Écran Mes adresses', () => {
  it('liste mes adresses publiques et privées et les filtre', async () => {
    await render(<EcranMesAdresses />);

    expect(screen.getByText('Boulangerie')).toBeOnTheScreen();
    expect(screen.getByText('Coin secret')).toBeOnTheScreen();

    await fireEvent.press(screen.getByTestId('filtre-privees'));
    expect(screen.queryByText('Boulangerie')).toBeNull();
    expect(screen.getByText('Coin secret')).toBeOnTheScreen();

    await fireEvent.press(screen.getByTestId('filtre-publiques'));
    expect(screen.getByText('Boulangerie')).toBeOnTheScreen();
    expect(screen.queryByText('Coin secret')).toBeNull();
  });

  it('ouvre le détail et la création', async () => {
    await render(<EcranMesAdresses />);

    await fireEvent.press(screen.getByTestId('carte-adresse-privee'));
    expect(mockRouteur.push).toHaveBeenCalledWith({ pathname: '/address/[id]', params: { id: 'privee' } });

    await fireEvent.press(screen.getByTestId('bouton-nouvelle-adresse'));
    expect(mockRouteur.push).toHaveBeenCalledWith('/address/new');
  });

  it('affiche un état vide', async () => {
    (useMesAdresses as jest.Mock).mockReturnValue({ adresses: [], chargement: false, erreur: null });
    await render(<EcranMesAdresses />);

    expect(screen.getByText('Aucune adresse')).toBeOnTheScreen();
  });
});

describe('Écran Explorer', () => {
  it('affiche les adresses publiques des autres avec leur auteur et permet la recherche', async () => {
    await render(<EcranExplorer />);

    expect(screen.getByText('Partagée par Marie')).toBeOnTheScreen();
    expect(screen.getByText('Partagée par Paul')).toBeOnTheScreen();

    await fireEvent.changeText(screen.getByTestId('champ-recherche'), 'louvre');
    expect(screen.getByText('Musée du Louvre')).toBeOnTheScreen();
    expect(screen.queryByText('Jardin')).toBeNull();
  });
});

describe('Écran Carte', () => {
  const { scriptsInjectes } = jest.requireMock('react-native-webview') as { scriptsInjectes: string[] };

  const envoyerMessageCarte = (message: Record<string, unknown>) =>
    fireEvent(screen.getByTestId('carte-adresses-webview'), 'message', {
      nativeEvent: { data: JSON.stringify(message) },
    });

  beforeEach(() => {
    scriptsInjectes.length = 0;
  });

  it('envoie un marqueur par adresse à la carte et propose l’ajout', async () => {
    await render(<EcranCarte />);
    expect(scriptsInjectes).toHaveLength(0);

    await envoyerMessageCarte({ type: 'pret' });

    await waitFor(() => expect(scriptsInjectes.some((script) => script.includes('mettreAJourCarte'))).toBe(true));
    const derniereMiseAJour = [...scriptsInjectes].reverse().find((script) => script.includes('mettreAJourCarte'));
    const etat = JSON.parse(derniereMiseAJour!.match(/mettreAJourCarte\((.*)\);true;$/)![1]);
    expect(etat.marqueurs.map((marqueur: { id: string; estPersonnel: boolean }) => [marqueur.id, marqueur.estPersonnel])).toEqual([
      ['publique', true],
      ['privee', true],
      ['p1', false],
      ['p2', false],
    ]);
    expect(etat.position).toEqual({ latitude: 48.85, longitude: 2.35 });
    expect(scriptsInjectes.some((script) => script.includes('recentrerCarte'))).toBe(true);

    await fireEvent.press(screen.getByTestId('bouton-ajouter-adresse'));
    expect(mockRouteur.push).toHaveBeenCalledWith('/address/new');
  });

  it("ouvre le détail depuis l'infobulle d'un marqueur", async () => {
    await render(<EcranCarte />);

    await envoyerMessageCarte({ type: 'selection', id: 'p1' });

    expect(mockRouteur.push).toHaveBeenCalledWith({ pathname: '/address/[id]', params: { id: 'p1' } });
  });

  it('ignore les messages invalides de la carte', async () => {
    await render(<EcranCarte />);

    await fireEvent(screen.getByTestId('carte-adresses-webview'), 'message', { nativeEvent: { data: 'pas du json' } });
    await envoyerMessageCarte({ type: 'selection', id: 42 });

    expect(mockRouteur.push).not.toHaveBeenCalled();
  });
});

describe('Écran Profil', () => {
  it('affiche les informations et statistiques du profil', async () => {
    await render(<EcranProfil />);

    expect(screen.getByTestId('nom-profil')).toHaveTextContent('Jean Dupont');
    expect(screen.getByText('jean@exemple.fr')).toBeOnTheScreen();
    expect(screen.getByText('JD')).toBeOnTheScreen();
  });

  it('change la photo de profil', async () => {
    (choisirImage as jest.Mock).mockResolvedValue('file://moi.jpg');
    changerPhotoProfil.mockResolvedValue(undefined);
    await render(<EcranProfil />);

    await fireEvent.press(screen.getByTestId('photo-profil-camera'));

    await waitFor(() => expect(changerPhotoProfil).toHaveBeenCalledWith('file://moi.jpg'));
    expect(choisirImage).toHaveBeenCalledWith('camera');
  });

  it("déconnecte l'utilisateur après confirmation", async () => {
    (confirmer as jest.Mock).mockResolvedValue(true);
    await render(<EcranProfil />);

    await fireEvent.press(screen.getByTestId('bouton-deconnexion'));

    await waitFor(() => expect(seDeconnecter).toHaveBeenCalled());
  });
});
