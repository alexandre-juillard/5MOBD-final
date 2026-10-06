import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { fn } from 'storybook/test';

import type { Adresse } from '@/types/models';

import { CarteAdresse } from './address-card';

const adresseExemple: Adresse = {
  id: 'exemple',
  proprietaireId: 'utilisateur-1',
  proprietaireNom: 'Marie Curie',
  nom: 'Boulangerie du Marché',
  description: 'Les meilleurs croissants du quartier, à découvrir le dimanche matin.',
  photoUrl: 'https://picsum.photos/id/431/300/300',
  adresseTexte: '12 rue du Marché, 75004 Paris',
  latitude: 48.8566,
  longitude: 2.3522,
  estPublique: true,
  creeLe: new Date(2026, 5, 1),
};

const meta = {
  title: 'Composants/CarteAdresse',
  component: CarteAdresse,
  args: {
    adresse: adresseExemple,
    onPress: fn(),
  },
} satisfies Meta<typeof CarteAdresse>;

export default meta;

type Histoire = StoryObj<typeof meta>;

export const Publique: Histoire = {};

export const PubliqueDUnAutre: Histoire = {
  args: { afficherProprietaire: true },
};

export const PriveeSansPhoto: Histoire = {
  args: {
    adresse: { ...adresseExemple, estPublique: false, photoUrl: null, nom: 'Mon coin lecture secret' },
  },
};
