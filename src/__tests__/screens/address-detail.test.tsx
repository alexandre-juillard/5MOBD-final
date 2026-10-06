import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import EcranDetailAdresse from '@/app/address/[id]';
import { useAuthentification } from '@/context/auth-context';
import { recupererAdresse, supprimerAdresse } from '@/services/address-service';
import { ecouterAvis, enregistrerAvis, supprimerAvis } from '@/services/review-service';
import { confirmer } from '@/utils/dialogs';

import { creerAdresseTest, creerAvisTest, profilTest } from '../fixtures';

const mockRouteur = { push: jest.fn(), back: jest.fn() };

jest.mock('expo-router', () => ({
  useRouter: () => mockRouteur,
  useLocalSearchParams: () => ({ id: 'adresse-1' }),
  Stack: { Screen: () => null },
}));
jest.mock('@/context/auth-context', () => ({ useAuthentification: jest.fn() }));
jest.mock('@/services/address-service', () => ({ recupererAdresse: jest.fn(), supprimerAdresse: jest.fn() }));
jest.mock('@/services/review-service', () => ({
  ecouterAvis: jest.fn(),
  enregistrerAvis: jest.fn(),
  supprimerAvis: jest.fn(),
}));
jest.mock('@/utils/image-picker', () => ({ choisirImage: jest.fn() }));
jest.mock('@/utils/dialogs', () => ({ informer: jest.fn(), confirmer: jest.fn() }));

const autreProfil = { id: 'visiteur', nom: 'Visiteur', photoUrl: null };

const simulerAvis = (listeAvis = [creerAvisTest({ note: 5 }), creerAvisTest({ id: 'x', auteurId: 'x', note: 4 })]) => {
  (ecouterAvis as jest.Mock).mockImplementation((_id, rappel) => {
    rappel(listeAvis);
    return jest.fn();
  });
};

const connecterEnTantQue = (profil: typeof profilTest) =>
  (useAuthentification as jest.Mock).mockReturnValue({ utilisateur: { uid: profil.id }, profil });

describe("Écran de détail d'une adresse", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    simulerAvis();
  });

  it("indique qu'une adresse est introuvable ou inaccessible", async () => {
    connecterEnTantQue(profilTest);
    (recupererAdresse as jest.Mock).mockRejectedValue({ code: 'permission-denied' });

    await render(<EcranDetailAdresse />);

    expect(await screen.findByTestId('detail-introuvable')).toBeOnTheScreen();
  });

  it('affiche la note moyenne et les avis', async () => {
    connecterEnTantQue(autreProfil);
    (recupererAdresse as jest.Mock).mockResolvedValue(creerAdresseTest());

    await render(<EcranDetailAdresse />);

    expect(await screen.findByTestId('detail-nom')).toHaveTextContent('Chez Paul');
    expect(screen.getByTestId('detail-note-moyenne')).toHaveTextContent('4,5/5 · 2 avis');
    expect(screen.getByText('Partagée par Jean Dupont le 1 juin 2026')).toBeOnTheScreen();
    expect(screen.getAllByText('Très bonne adresse')).toHaveLength(2);
  });

  it('permet au propriétaire de supprimer son adresse après confirmation', async () => {
    connecterEnTantQue(profilTest);
    const adresse = creerAdresseTest();
    (recupererAdresse as jest.Mock).mockResolvedValue(adresse);
    (confirmer as jest.Mock).mockResolvedValue(true);
    (supprimerAdresse as jest.Mock).mockResolvedValue(undefined);

    await render(<EcranDetailAdresse />);
    await fireEvent.press(await screen.findByTestId('bouton-supprimer-adresse'));

    await waitFor(() => expect(mockRouteur.back).toHaveBeenCalled());
    expect(supprimerAdresse).toHaveBeenCalledWith(adresse);
    expect(screen.queryByTestId('formulaire-avis')).toBeNull();
    expect(screen.getByText('Vous ne pouvez pas noter votre propre adresse.')).toBeOnTheScreen();
  });

  it("n'efface rien si la suppression est annulée", async () => {
    connecterEnTantQue(profilTest);
    (recupererAdresse as jest.Mock).mockResolvedValue(creerAdresseTest());
    (confirmer as jest.Mock).mockResolvedValue(false);

    await render(<EcranDetailAdresse />);
    await fireEvent.press(await screen.findByTestId('bouton-supprimer-adresse'));

    expect(supprimerAdresse).not.toHaveBeenCalled();
  });

  it("permet à un autre utilisateur de publier un avis sur une adresse publique", async () => {
    connecterEnTantQue(autreProfil);
    (recupererAdresse as jest.Mock).mockResolvedValue(creerAdresseTest());
    (enregistrerAvis as jest.Mock).mockResolvedValue(undefined);

    await render(<EcranDetailAdresse />);
    await screen.findByTestId('formulaire-avis');
    expect(screen.queryByTestId('bouton-supprimer-adresse')).toBeNull();

    await fireEvent.press(screen.getByTestId('etoile-5'));
    await fireEvent.changeText(screen.getByTestId('champ-commentaire'), 'Parfait');
    await fireEvent.press(screen.getByTestId('bouton-publier-avis'));

    await waitFor(() =>
      expect(enregistrerAvis).toHaveBeenCalledWith('adresse-1', autreProfil, {
        note: 5,
        commentaire: 'Parfait',
        photoUri: null,
        photoUrlExistante: null,
      }),
    );
  });

  it("permet à l'auteur de supprimer son avis", async () => {
    const monAvis = creerAvisTest({ id: 'visiteur', auteurId: 'visiteur', auteurNom: 'Visiteur' });
    simulerAvis([monAvis]);
    connecterEnTantQue(autreProfil);
    (recupererAdresse as jest.Mock).mockResolvedValue(creerAdresseTest());
    (confirmer as jest.Mock).mockResolvedValue(true);

    await render(<EcranDetailAdresse />);
    expect(await screen.findByText('Modifier mon avis')).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId('supprimer-avis-visiteur'));

    await waitFor(() => expect(supprimerAvis).toHaveBeenCalledWith('adresse-1', monAvis));
  });

  it("n'affiche ni avis ni formulaire pour une adresse privée", async () => {
    connecterEnTantQue(profilTest);
    (recupererAdresse as jest.Mock).mockResolvedValue(creerAdresseTest({ estPublique: false }));

    await render(<EcranDetailAdresse />);

    expect(await screen.findByText(/Cette adresse est privée/)).toBeOnTheScreen();
    expect(screen.queryByTestId('formulaire-avis')).toBeNull();
    expect(screen.queryByTestId('detail-note-moyenne')).toBeNull();
  });
});
