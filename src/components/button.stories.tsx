import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { fn } from 'storybook/test';

import { Bouton } from './button';

const meta = {
  title: 'Composants/Bouton',
  component: Bouton,
  args: {
    libelle: 'Enregistrer',
    onPress: fn(),
  },
  argTypes: {
    variante: {
      control: 'select',
      options: ['primaire', 'secondaire', 'danger', 'lien'],
    },
  },
} satisfies Meta<typeof Bouton>;

export default meta;

type Histoire = StoryObj<typeof meta>;

export const Primaire: Histoire = {};

export const Secondaire: Histoire = {
  args: { variante: 'secondaire', libelle: 'Se déconnecter' },
};

export const Danger: Histoire = {
  args: { variante: 'danger', libelle: 'Supprimer cette adresse' },
};

export const Lien: Histoire = {
  args: { variante: 'lien', libelle: '📍 Utiliser ma position actuelle' },
};

export const EnChargement: Histoire = {
  args: { chargement: true },
};

export const Desactive: Histoire = {
  args: { desactive: true },
};
