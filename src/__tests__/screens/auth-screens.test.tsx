import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import EcranConnexion from '@/app/login';
import EcranInscription from '@/app/register';
import { useAuthentification } from '@/context/auth-context';

jest.mock('@/context/auth-context', () => ({ useAuthentification: jest.fn() }));

jest.mock('expo-router', () => {
  const React = jest.requireActual('react');
  const { Text } = jest.requireActual('react-native');
  return {
    Link: ({ children, testID }: { children: unknown; testID?: string }) =>
      React.createElement(Text, { testID }, children),
  };
});

const seConnecter = jest.fn();
const sInscrire = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useAuthentification as jest.Mock).mockReturnValue({ seConnecter, sInscrire });
});

describe('Écran de connexion', () => {
  it('affiche les erreurs de validation sans appeler Firebase', async () => {
    await render(<EcranConnexion />);

    await fireEvent.press(screen.getByTestId('bouton-connexion'));

    expect(screen.getByTestId('connexion-email-erreur')).toHaveTextContent("L'email est obligatoire.");
    expect(screen.getByTestId('connexion-mot-de-passe-erreur')).toHaveTextContent('Le mot de passe est obligatoire.');
    expect(seConnecter).not.toHaveBeenCalled();
  });

  it("connecte l'utilisateur avec ses identifiants", async () => {
    seConnecter.mockResolvedValue(undefined);
    await render(<EcranConnexion />);

    await fireEvent.changeText(screen.getByTestId('connexion-email'), 'jean@exemple.fr');
    await fireEvent.changeText(screen.getByTestId('connexion-mot-de-passe'), 'secret1');
    await fireEvent.press(screen.getByTestId('bouton-connexion'));

    expect(seConnecter).toHaveBeenCalledWith('jean@exemple.fr', 'secret1');
  });

  it('affiche un message en français si les identifiants sont faux', async () => {
    seConnecter.mockRejectedValue({ code: 'auth/invalid-credential' });
    await render(<EcranConnexion />);

    await fireEvent.changeText(screen.getByTestId('connexion-email'), 'jean@exemple.fr');
    await fireEvent.changeText(screen.getByTestId('connexion-mot-de-passe'), 'mauvais');
    await fireEvent.press(screen.getByTestId('bouton-connexion'));

    expect(await screen.findByTestId('erreur-connexion')).toHaveTextContent('Email ou mot de passe incorrect.');
  });

  it("propose un lien vers l'inscription", async () => {
    await render(<EcranConnexion />);
    expect(screen.getByTestId('lien-inscription')).toHaveTextContent('Créer un compte');
  });
});

describe("Écran d'inscription", () => {
  const remplirFormulaire = async (confirmation = 'secret1') => {
    await fireEvent.changeText(screen.getByTestId('inscription-nom'), 'Jean');
    await fireEvent.changeText(screen.getByTestId('inscription-email'), 'jean@exemple.fr');
    await fireEvent.changeText(screen.getByTestId('inscription-mot-de-passe'), 'secret1');
    await fireEvent.changeText(screen.getByTestId('inscription-confirmation'), confirmation);
  };

  it('vérifie la confirmation du mot de passe', async () => {
    await render(<EcranInscription />);

    await remplirFormulaire('autre');
    await fireEvent.press(screen.getByTestId('bouton-inscription'));

    expect(screen.getByTestId('inscription-confirmation-erreur')).toHaveTextContent('Les mots de passe ne correspondent pas.');
    expect(sInscrire).not.toHaveBeenCalled();
  });

  it('crée le compte', async () => {
    sInscrire.mockResolvedValue(undefined);
    await render(<EcranInscription />);

    await remplirFormulaire();
    await fireEvent.press(screen.getByTestId('bouton-inscription'));

    await waitFor(() => expect(sInscrire).toHaveBeenCalledWith('Jean', 'jean@exemple.fr', 'secret1'));
  });

  it('signale un email déjà utilisé', async () => {
    sInscrire.mockRejectedValue({ code: 'auth/email-already-in-use' });
    await render(<EcranInscription />);

    await remplirFormulaire();
    await fireEvent.press(screen.getByTestId('bouton-inscription'));

    expect(await screen.findByTestId('erreur-inscription')).toHaveTextContent('Un compte existe déjà avec cet email.');
  });
});
