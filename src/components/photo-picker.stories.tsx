import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { fn } from 'storybook/test';

import { SelecteurPhoto } from './photo-picker';

const meta = {
  title: 'Composants/SelecteurPhoto',
  component: SelecteurPhoto,
  args: {
    libelle: 'Photo (facultative)',
    uri: null,
    onChoisir: fn(),
    onRetirer: fn(),
  },
} satisfies Meta<typeof SelecteurPhoto>;

export default meta;

type Histoire = StoryObj<typeof meta>;

export const SansPhoto: Histoire = {};

export const AvecPhoto: Histoire = {
  args: { uri: 'https://picsum.photos/id/292/800/500' },
};

export const Desactive: Histoire = {
  args: { desactive: true, libelle: 'Envoi de la photo...' },
};
