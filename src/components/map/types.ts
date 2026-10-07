import type { StyleProp, ViewStyle } from 'react-native';

import type { Coordonnees } from '@/types/models';

export type MarqueurCarte = Coordonnees & {
  id: string;
  titre: string;
  description: string;
  estPersonnel: boolean;
};

export type ProprietesCarteAdresses = {
  position: Coordonnees | null;
  marqueurs: MarqueurCarte[];
  onSelection: (id: string) => void;
  style?: StyleProp<ViewStyle>;
};

export type ProprietesSelecteurEmplacement = {
  emplacement: Coordonnees | null;
  centre: Coordonnees | null;
  onChange: (coordonnees: Coordonnees) => void;
  style?: StyleProp<ViewStyle>;
};
