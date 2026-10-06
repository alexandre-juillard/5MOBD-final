import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { EtatVide } from './empty-state';

const meta = {
  title: 'Composants/EtatVide',
  component: EtatVide,
  args: {
    titre: 'Aucune adresse',
    message: 'Ajoutez votre première bonne adresse !',
  },
} satisfies Meta<typeof EtatVide>;

export default meta;

type Histoire = StoryObj<typeof meta>;

export const ListeVide: Histoire = {};

export const Chargement: Histoire = {
  args: { titre: 'Chargement...', message: undefined, chargement: true },
};

export const Inaccessible: Histoire = {
  args: {
    icone: '🔒',
    titre: 'Adresse introuvable',
    message: "Cette adresse n'existe plus ou n'est pas accessible.",
  },
};
