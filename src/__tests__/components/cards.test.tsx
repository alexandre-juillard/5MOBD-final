import { fireEvent, render, screen } from '@testing-library/react-native';

import { CarteAdresse } from '@/components/address-card';
import { SelecteurPhoto } from '@/components/photo-picker';
import { CarteAvis } from '@/components/review-card';

import { creerAdresseTest, creerAvisTest } from '../fixtures';

describe('CarteAdresse', () => {
  it("affiche les informations de l'adresse et réagit à l'appui", async () => {
    const adresse = creerAdresseTest({ estPublique: false });
    const auClic = jest.fn();
    await render(<CarteAdresse adresse={adresse} onPress={auClic} />);

    expect(screen.getByText('Chez Paul')).toBeOnTheScreen();
    expect(screen.getByText('Un bistrot chaleureux')).toBeOnTheScreen();
    expect(screen.getByText('Privée')).toBeOnTheScreen();
    expect(screen.queryByText(/Partagée par/)).toBeNull();

    await fireEvent.press(screen.getByTestId('carte-adresse-adresse-1'));
    expect(auClic).toHaveBeenCalledWith(adresse);
  });

  it('affiche le propriétaire pour les adresses publiques des autres', async () => {
    await render(
      <CarteAdresse adresse={creerAdresseTest({ proprietaireNom: 'Marie' })} onPress={jest.fn()} afficherProprietaire />,
    );

    expect(screen.getByText('Partagée par Marie')).toBeOnTheScreen();
  });
});

describe('CarteAvis', () => {
  it("affiche l'auteur, la note et le commentaire", async () => {
    await render(<CarteAvis avis={creerAvisTest()} />);

    expect(screen.getByText('Marie Curie')).toBeOnTheScreen();
    expect(screen.getByText('Très bonne adresse')).toBeOnTheScreen();
    expect(screen.getByLabelText('Note : 4 sur 5')).toBeOnTheScreen();
    expect(screen.queryByText('Supprimer')).toBeNull();
  });

  it('affiche la photo du commentaire et permet la suppression', async () => {
    const avis = creerAvisTest({ photoUrl: 'https://photo-avis.jpg' });
    const auSupprimer = jest.fn();
    await render(<CarteAvis avis={avis} peutSupprimer onSupprimer={auSupprimer} />);

    expect(screen.getByLabelText("Photo de l'avis")).toBeOnTheScreen();
    await fireEvent.press(screen.getByText('Supprimer'));
    expect(auSupprimer).toHaveBeenCalledWith(avis);
  });
});

describe('SelecteurPhoto', () => {
  it('propose la galerie et l’appareil photo', async () => {
    const auChoix = jest.fn();
    await render(<SelecteurPhoto uri={null} onChoisir={auChoix} />);

    await fireEvent.press(screen.getByText('🖼️ Galerie'));
    await fireEvent.press(screen.getByText('📷 Appareil photo'));

    expect(auChoix).toHaveBeenNthCalledWith(1, 'galerie');
    expect(auChoix).toHaveBeenNthCalledWith(2, 'camera');
  });

  it("affiche l'aperçu et permet de retirer la photo", async () => {
    const auRetrait = jest.fn();
    await render(<SelecteurPhoto uri="file://photo.jpg" onChoisir={jest.fn()} onRetirer={auRetrait} />);

    expect(screen.getByTestId('selecteur-photo-apercu')).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId('selecteur-photo-retirer'));
    expect(auRetrait).toHaveBeenCalled();
  });
});
