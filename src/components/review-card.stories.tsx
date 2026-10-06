import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { fn } from 'storybook/test';

import type { Avis } from '@/types/models';

import { CarteAvis } from './review-card';

const avisExemple: Avis = {
  id: 'auteur-1',
  auteurId: 'auteur-1',
  auteurNom: 'Paul Martin',
  auteurPhotoUrl: null,
  note: 4,
  commentaire: 'Accueil chaleureux et produits délicieux. Je recommande vivement !',
  photoUrl: null,
  creeLe: new Date(2026, 8, 12),
};

const meta = {
  title: 'Composants/CarteAvis',
  component: CarteAvis,
  args: {
    avis: avisExemple,
    onSupprimer: fn(),
  },
} satisfies Meta<typeof CarteAvis>;

export default meta;

type Histoire = StoryObj<typeof meta>;

export const Commentaire: Histoire = {};

export const AvecPhoto: Histoire = {
  args: {
    avis: { ...avisExemple, note: 5, photoUrl: 'https://picsum.photos/id/292/800/500' },
  },
};

export const PhotoSeule: Histoire = {
  args: {
    avis: { ...avisExemple, commentaire: '', photoUrl: 'https://picsum.photos/id/429/800/500' },
  },
};

export const SupprimableParLAuteur: Histoire = {
  args: { peutSupprimer: true },
};
