import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import EcranNouvelleAdresse from '@/app/address/new';
import { useAuthentification } from '@/context/auth-context';
import { creerAdresse } from '@/services/address-service';
import { obtenirAdresseDepuisCoordonnees, rechercherAdresse } from '@/services/geocoding-service';
import { choisirImage } from '@/utils/image-picker';

import { profilTest } from '../fixtures';

const mockRouteur = { push: jest.fn(), back: jest.fn() };

jest.mock('expo-router', () => ({ useRouter: () => mockRouteur }));
jest.mock('@/context/auth-context', () => ({ useAuthentification: jest.fn() }));
jest.mock('@/services/address-service', () => ({ creerAdresse: jest.fn() }));
jest.mock('@/services/geocoding-service', () => ({
  rechercherAdresse: jest.fn(),
  obtenirAdresseDepuisCoordonnees: jest.fn(async () => '1 rue de Rivoli, Paris'),
}));
jest.mock('@/utils/image-picker', () => ({ choisirImage: jest.fn() }));
jest.mock('@/utils/dialogs', () => ({ informer: jest.fn(), confirmer: jest.fn() }));

describe("Écran de création d'adresse", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthentification as jest.Mock).mockReturnValue({ profil: profilTest });
    (creerAdresse as jest.Mock).mockResolvedValue('nouvel-id');
  });

  it("exige un nom et un emplacement", async () => {
    await render(<EcranNouvelleAdresse />);

    await fireEvent.press(screen.getByTestId('bouton-enregistrer-adresse'));

    expect(screen.getByTestId('champ-nom-adresse-erreur')).toBeOnTheScreen();
    expect(screen.getByTestId('emplacement-erreur')).toHaveTextContent("Choisissez l'emplacement de l'adresse.");
    expect(creerAdresse).not.toHaveBeenCalled();
  });

  it('crée une adresse publique avec photo à la position actuelle', async () => {
    (choisirImage as jest.Mock).mockResolvedValue('file://photo.jpg');
    await render(<EcranNouvelleAdresse />);

    await fireEvent.changeText(screen.getByTestId('champ-nom-adresse'), 'Chez Paul');
    await fireEvent.changeText(screen.getByTestId('champ-description'), 'Bistrot');
    await fireEvent.press(screen.getByTestId('option-publique'));
    await fireEvent.press(screen.getByTestId('photo-adresse-galerie'));
    await screen.findByTestId('photo-adresse-apercu');
    await fireEvent.press(screen.getByTestId('bouton-ma-position'));
    expect(await screen.findByTestId('emplacement-choisi')).toHaveTextContent('✓ 1 rue de Rivoli, Paris');

    await fireEvent.press(screen.getByTestId('bouton-enregistrer-adresse'));

    await waitFor(() => expect(mockRouteur.back).toHaveBeenCalled());
    expect(obtenirAdresseDepuisCoordonnees).toHaveBeenCalledWith({ latitude: 48.85, longitude: 2.35 });
    expect(creerAdresse).toHaveBeenCalledWith(profilTest, {
      nom: 'Chez Paul',
      description: 'Bistrot',
      estPublique: true,
      photoUri: 'file://photo.jpg',
      adresseTexte: '1 rue de Rivoli, Paris',
      latitude: 48.85,
      longitude: 2.35,
    });
  });

  it('place le repère à partir d’une adresse saisie', async () => {
    (rechercherAdresse as jest.Mock).mockResolvedValue([
      { latitude: 48.8584, longitude: 2.2945, libelle: 'Tour Eiffel, Paris' },
    ]);
    await render(<EcranNouvelleAdresse />);

    await fireEvent.changeText(screen.getByTestId('champ-recherche-adresse'), 'Tour Eiffel');
    await fireEvent.press(screen.getByTestId('bouton-rechercher-adresse'));
    await fireEvent.press(await screen.findByTestId('resultat-recherche-0'));

    expect(rechercherAdresse).toHaveBeenCalledWith('Tour Eiffel');
    expect(screen.getByTestId('emplacement-choisi')).toHaveTextContent('✓ Tour Eiffel, Paris');
    expect(obtenirAdresseDepuisCoordonnees).not.toHaveBeenCalled();

    await fireEvent.changeText(screen.getByTestId('champ-nom-adresse'), 'Tour Eiffel');
    await fireEvent.press(screen.getByTestId('bouton-enregistrer-adresse'));

    await waitFor(() =>
      expect(creerAdresse).toHaveBeenCalledWith(
        profilTest,
        expect.objectContaining({ estPublique: false, latitude: 48.8584, longitude: 2.2945, photoUri: null }),
      ),
    );
  });

  it('place le repère en appuyant sur la carte', async () => {
    await render(<EcranNouvelleAdresse />);

    await fireEvent(screen.getByTestId('selecteur-emplacement-webview'), 'message', {
      nativeEvent: { data: JSON.stringify({ type: 'clic', latitude: 45.76, longitude: 4.83 }) },
    });

    expect(await screen.findByTestId('emplacement-choisi')).toHaveTextContent('✓ 1 rue de Rivoli, Paris');
    expect(obtenirAdresseDepuisCoordonnees).toHaveBeenCalledWith({ latitude: 45.76, longitude: 4.83 });
  });
});
