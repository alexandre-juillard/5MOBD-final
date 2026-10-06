import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { Avatar } from './avatar';

const meta = {
  title: 'Composants/Avatar',
  component: Avatar,
  args: {
    nom: 'Jean Dupont',
    uri: null,
    taille: 64,
  },
} satisfies Meta<typeof Avatar>;

export default meta;

type Histoire = StoryObj<typeof meta>;

export const Initiales: Histoire = {};

export const AvecPhoto: Histoire = {
  args: { uri: 'https://picsum.photos/id/64/200/200' },
};

export const Grand: Histoire = {
  args: { taille: 112 },
};
