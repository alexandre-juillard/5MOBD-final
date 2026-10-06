import { fireEvent, render, screen } from '@testing-library/react-native';

import { FormulaireAvis } from '@/components/review-form';

import { creerAvisTest } from '../fixtures';

describe('FormulaireAvis', () => {
  it('bloque la soumission sans note ni contenu', async () => {
    const auSoumettre = jest.fn();
    await render(<FormulaireAvis choisirPhoto={jest.fn()} onSoumettre={auSoumettre} />);

    await fireEvent.press(screen.getByTestId('bouton-publier-avis'));

    expect(auSoumettre).not.toHaveBeenCalled();
    expect(screen.getByTestId('note-erreur')).toHaveTextContent('Choisissez une note entre 1 et 5.');
    expect(screen.getByTestId('champ-commentaire-erreur')).toHaveTextContent('Ajoutez un commentaire ou une photo.');
  });

  it('soumet une note et un commentaire', async () => {
    const auSoumettre = jest.fn();
    await render(<FormulaireAvis choisirPhoto={jest.fn()} onSoumettre={auSoumettre} />);

    await fireEvent.press(screen.getByTestId('etoile-5'));
    await fireEvent.changeText(screen.getByTestId('champ-commentaire'), 'Génial !');
    await fireEvent.press(screen.getByTestId('bouton-publier-avis'));

    expect(auSoumettre).toHaveBeenCalledWith({
      note: 5,
      commentaire: 'Génial !',
      photoUri: null,
      photoUrlExistante: null,
    });
  });

  it('accepte un avis avec uniquement une photo', async () => {
    const auSoumettre = jest.fn();
    const choisirPhoto = jest.fn(async () => 'file://avis.jpg');
    await render(<FormulaireAvis choisirPhoto={choisirPhoto} onSoumettre={auSoumettre} />);

    await fireEvent.press(screen.getByTestId('etoile-3'));
    await fireEvent.press(screen.getByTestId('photo-avis-galerie'));
    await screen.findByTestId('photo-avis-apercu');
    await fireEvent.press(screen.getByTestId('bouton-publier-avis'));

    expect(choisirPhoto).toHaveBeenCalledWith('galerie');
    expect(auSoumettre).toHaveBeenCalledWith({
      note: 3,
      commentaire: '',
      photoUri: 'file://avis.jpg',
      photoUrlExistante: null,
    });
  });

  it('pré-remplit le formulaire pour modifier un avis existant', async () => {
    const auSoumettre = jest.fn();
    const avis = creerAvisTest({ note: 2, commentaire: 'Moyen', photoUrl: 'https://ancienne.jpg' });
    await render(<FormulaireAvis avisExistant={avis} choisirPhoto={jest.fn()} onSoumettre={auSoumettre} />);

    expect(screen.getByText('Modifier mon avis')).toBeOnTheScreen();
    expect(screen.getByTestId('champ-commentaire')).toHaveDisplayValue('Moyen');

    await fireEvent.press(screen.getByTestId('bouton-publier-avis'));
    expect(auSoumettre).toHaveBeenCalledWith({
      note: 2,
      commentaire: 'Moyen',
      photoUri: null,
      photoUrlExistante: 'https://ancienne.jpg',
    });
  });
});
