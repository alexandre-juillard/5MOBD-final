import { ActivityIndicator, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { couleurs, espacements, rayons } from '@/constants/theme';

export type VarianteBouton = 'primaire' | 'secondaire' | 'danger' | 'lien';

export type ProprietesBouton = {
  libelle: string;
  onPress: () => void;
  variante?: VarianteBouton;
  chargement?: boolean;
  desactive?: boolean;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

const couleursTexte: Record<VarianteBouton, string> = {
  primaire: couleurs.blanc,
  secondaire: couleurs.primaire,
  danger: couleurs.blanc,
  lien: couleurs.secondaire,
};

export function Bouton({
  libelle,
  onPress,
  variante = 'primaire',
  chargement = false,
  desactive = false,
  testID,
  style,
}: ProprietesBouton) {
  const inactif = desactive || chargement;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={libelle}
      accessibilityState={{ disabled: inactif, busy: chargement }}
      disabled={inactif}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [styles.base, styles[variante], pressed && styles.appuye, inactif && styles.inactif, style]}>
      {chargement ? (
        <ActivityIndicator color={couleursTexte[variante]} testID={testID ? `${testID}-chargement` : undefined} />
      ) : (
        <Text style={[styles.libelle, { color: couleursTexte[variante] }]}>{libelle}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingHorizontal: espacements.l,
    borderRadius: rayons.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaire: {
    backgroundColor: couleurs.primaire,
  },
  secondaire: {
    backgroundColor: couleurs.surface,
    borderWidth: 1.5,
    borderColor: couleurs.primaire,
  },
  danger: {
    backgroundColor: couleurs.erreur,
  },
  lien: {
    backgroundColor: 'transparent',
  },
  appuye: {
    opacity: 0.8,
  },
  inactif: {
    opacity: 0.5,
  },
  libelle: {
    fontSize: 16,
    fontWeight: '600',
  },
});
