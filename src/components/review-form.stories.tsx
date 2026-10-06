import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { fn } from 'storybook/test';

import { FormulaireAvis } from './review-form';

const meta = {
  title: 'Composants/FormulaireAvis',
  component: FormulaireAvis,
  args: {
    choisirPhoto: fn(async () => 'https://picsum.photos/id/225/800/500'),
    onSoumettre: fn(),
  },
} satisfies Meta<typeof FormulaireAvis>;

export default meta;

type Histoire = StoryObj<typeof meta>;

export const NouvelAvis: Histoire = {};

export const ModificationAvis: Histoire = {
  args: {
    avisExistant: {
      id: 'moi',
      auteurId: 'moi',
      auteurNom: 'Jean Dupont',
      auteurPhotoUrl: null,
      note: 3,
      commentaire: 'Bien, mais un peu bruyant le soir.',
      photoUrl: null,
      creeLe: new Date(2026, 8, 1),
    },
  },
};

export const EnregistrementEnCours: Histoire = {
  args: { enregistrement: true },
};
