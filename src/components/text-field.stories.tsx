import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { fn } from 'storybook/test';

import { ChampTexte } from './text-field';

const meta = {
  title: 'Composants/ChampTexte',
  component: ChampTexte,
  args: {
    libelle: 'Email',
    placeholder: 'vous@exemple.fr',
    onChangeText: fn(),
  },
} satisfies Meta<typeof ChampTexte>;

export default meta;

type Histoire = StoryObj<typeof meta>;

export const Vide: Histoire = {};

export const Rempli: Histoire = {
  args: { value: 'jean@exemple.fr' },
};

export const AvecErreur: Histoire = {
  args: { value: 'jean@', erreur: "L'email n'est pas valide." },
};

export const MotDePasse: Histoire = {
  args: { libelle: 'Mot de passe', placeholder: '6 caractères minimum', secureTextEntry: true, value: 'secret' },
};

export const Multiligne: Histoire = {
  args: { libelle: 'Description', placeholder: 'Ce que vous aimez à cet endroit...', multiline: true },
};
