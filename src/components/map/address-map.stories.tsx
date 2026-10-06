import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { useState } from 'react';
import { View } from 'react-native';
import { fn } from 'storybook/test';

import type { Coordonnees } from '@/types/models';

import { CarteAdresses } from './address-map';
import { SelecteurEmplacement } from './location-picker-map';

const meta = {
  title: 'Carte/CarteAdresses',
  component: CarteAdresses,
  decorators: [
    (Histoire) => (
      <View style={{ height: 420 }}>
        <Histoire />
      </View>
    ),
  ],
  args: {
    position: { latitude: 48.8566, longitude: 2.3522 },
    onSelection: fn(),
    marqueurs: [
      {
        id: 'perso',
        titre: 'Ma boulangerie',
        description: 'Croissants au top',
        latitude: 48.8606,
        longitude: 2.3376,
        estPersonnel: true,
      },
      {
        id: 'public',
        titre: 'Jardin partagé',
        description: 'Par Marie',
        latitude: 48.853,
        longitude: 2.3499,
        estPersonnel: false,
      },
    ],
  },
} satisfies Meta<typeof CarteAdresses>;

export default meta;

type Histoire = StoryObj<typeof meta>;

export const AvecMarqueurs: Histoire = {};

export const SansPosition: Histoire = {
  args: { position: null, marqueurs: [] },
};

function SelecteurInteractif() {
  const [emplacement, definirEmplacement] = useState<Coordonnees | null>(null);
  return (
    <SelecteurEmplacement
      emplacement={emplacement}
      centre={{ latitude: 48.8566, longitude: 2.3522 }}
      onChange={definirEmplacement}
    />
  );
}

export const SelectionEmplacement: Histoire = {
  render: () => <SelecteurInteractif />,
};
