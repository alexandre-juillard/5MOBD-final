import { Image, StyleSheet, Text, View } from 'react-native';

import { couleurs } from '@/constants/theme';

export type ProprietesAvatar = {
  uri: string | null;
  nom: string;
  taille?: number;
  testID?: string;
};

export const extraireInitiales = (nom: string): string =>
  nom
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((mot) => mot[0]?.toUpperCase() ?? '')
    .join('') || '?';

export function Avatar({ uri, nom, taille = 48, testID }: ProprietesAvatar) {
  const dimensions = { width: taille, height: taille, borderRadius: taille / 2 };
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.image, dimensions]}
        accessibilityLabel={`Photo de ${nom}`}
        testID={testID}
      />
    );
  }
  return (
    <View style={[styles.initiales, dimensions]} testID={testID} accessibilityLabel={`Avatar de ${nom}`}>
      <Text style={[styles.texte, { fontSize: taille * 0.4 }]}>{extraireInitiales(nom)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: couleurs.bordure,
  },
  initiales: {
    backgroundColor: couleurs.secondaire,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texte: {
    color: couleurs.blanc,
    fontWeight: '700',
  },
});
