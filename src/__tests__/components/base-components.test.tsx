import { fireEvent, render, screen } from '@testing-library/react-native';

import { Avatar, extraireInitiales } from '@/components/avatar';
import { Bouton } from '@/components/button';
import { EtatVide } from '@/components/empty-state';
import { NoteEtoiles } from '@/components/star-rating';
import { ChampTexte } from '@/components/text-field';
import { BadgeVisibilite } from '@/components/visibility-badge';
import { SelecteurVisibilite } from '@/components/visibility-switch';

describe('Bouton', () => {
  it('déclenche onPress', async () => {
    const auClic = jest.fn();
    await render(<Bouton libelle="Valider" onPress={auClic} testID="bouton" />);

    await fireEvent.press(screen.getByText('Valider'));

    expect(auClic).toHaveBeenCalledTimes(1);
  });

  it('affiche un indicateur et bloque le clic pendant le chargement', async () => {
    const auClic = jest.fn();
    await render(<Bouton libelle="Valider" onPress={auClic} chargement testID="bouton" />);

    expect(screen.queryByText('Valider')).toBeNull();
    expect(screen.getByTestId('bouton-chargement')).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId('bouton'));
    expect(auClic).not.toHaveBeenCalled();
  });

  it('est désactivé quand demandé', async () => {
    const auClic = jest.fn();
    await render(<Bouton libelle="Valider" onPress={auClic} desactive testID="bouton" />);

    expect(screen.getByTestId('bouton')).toBeDisabled();
  });
});

describe('ChampTexte', () => {
  it('affiche le libellé, transmet la saisie et affiche une erreur', async () => {
    const auChangement = jest.fn();
    await render(<ChampTexte libelle="Nom" value="" onChangeText={auChangement} erreur="Obligatoire" testID="champ" />);

    expect(screen.getByText('Nom')).toBeOnTheScreen();
    await fireEvent.changeText(screen.getByTestId('champ'), 'Paul');
    expect(auChangement).toHaveBeenCalledWith('Paul');
    expect(screen.getByTestId('champ-erreur')).toHaveTextContent('Obligatoire');
  });
});

describe('NoteEtoiles', () => {
  it('affiche la note en lecture seule', async () => {
    await render(<NoteEtoiles note={3.6} testID="note" />);

    expect(screen.getByLabelText('Note : 4 sur 5')).toBeOnTheScreen();
    expect(screen.queryByTestId('etoile-1')).toBeNull();
  });

  it('permet de choisir une note', async () => {
    const auChangement = jest.fn();
    await render(<NoteEtoiles note={0} onChange={auChangement} />);

    await fireEvent.press(screen.getByTestId('etoile-4'));

    expect(auChangement).toHaveBeenCalledWith(4);
  });
});

describe('Avatar', () => {
  it('extrait les initiales', () => {
    expect(extraireInitiales('jean dupont')).toBe('JD');
    expect(extraireInitiales('Marie')).toBe('M');
    expect(extraireInitiales('  ')).toBe('?');
  });

  it('affiche les initiales sans photo', async () => {
    await render(<Avatar uri={null} nom="Jean Dupont" />);
    expect(screen.getByText('JD')).toBeOnTheScreen();
  });

  it('affiche la photo si elle existe', async () => {
    await render(<Avatar uri="https://photo.jpg" nom="Jean" />);
    expect(screen.getByLabelText('Photo de Jean')).toBeOnTheScreen();
  });
});

describe('Visibilité', () => {
  it('affiche le badge adapté', async () => {
    await render(<BadgeVisibilite estPublique />);
    expect(screen.getByText('Publique')).toBeOnTheScreen();

    await screen.rerender(<BadgeVisibilite estPublique={false} />);
    expect(screen.getByText('Privée')).toBeOnTheScreen();
  });

  it('change la visibilité via le sélecteur', async () => {
    const auChangement = jest.fn();
    await render(<SelecteurVisibilite estPublique={false} onChange={auChangement} />);

    expect(screen.getByTestId('option-privee')).toBeChecked();
    await fireEvent.press(screen.getByTestId('option-publique'));
    expect(auChangement).toHaveBeenCalledWith(true);
  });
});

describe('EtatVide', () => {
  it('affiche le titre et le message', async () => {
    await render(<EtatVide titre="Rien ici" message="Ajoutez une adresse" />);

    expect(screen.getByText('Rien ici')).toBeOnTheScreen();
    expect(screen.getByText('Ajoutez une adresse')).toBeOnTheScreen();
  });
});
