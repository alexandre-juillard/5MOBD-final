import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { useState } from 'react';

import { BadgeVisibilite } from './visibility-badge';
import { SelecteurVisibilite } from './visibility-switch';

const meta = {
  title: 'Composants/Visibilité',
  component: BadgeVisibilite,
  args: {
    estPublique: true,
  },
} satisfies Meta<typeof BadgeVisibilite>;

export default meta;

type Histoire = StoryObj<typeof meta>;

export const BadgePublique: Histoire = {};

export const BadgePrivee: Histoire = {
  args: { estPublique: false },
};

function SelecteurInteractif() {
  const [estPublique, definirEstPublique] = useState(false);
  return <SelecteurVisibilite estPublique={estPublique} onChange={definirEstPublique} />;
}

export const Selecteur: Histoire = {
  render: () => <SelecteurInteractif />,
};
