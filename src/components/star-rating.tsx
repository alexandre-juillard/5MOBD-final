import { Pressable, StyleSheet, Text, View } from 'react-native';

import { couleurs } from '@/constants/theme';

export type ProprietesNoteEtoiles = {
  note: number;
  onChange?: (note: number) => void;
  taille?: number;
  testID?: string;
};

const valeursEtoiles = [1, 2, 3, 4, 5];

export function NoteEtoiles({ note, onChange, taille = 20, testID }: ProprietesNoteEtoiles) {
  const noteArrondie = Math.round(note);
  return (
    <View
      style={styles.ligne}
      testID={testID}
      accessibilityRole={onChange ? 'adjustable' : 'text'}
      accessibilityLabel={`Note : ${noteArrondie} sur 5`}>
      {valeursEtoiles.map((valeur) => {
        const remplie = valeur <= noteArrondie;
        const etoile = (
          <Text style={[styles.etoile, { fontSize: taille, color: remplie ? couleurs.etoile : couleurs.etoileVide }]}>
            ★
          </Text>
        );
        if (!onChange) {
          return <View key={valeur}>{etoile}</View>;
        }
        return (
          <Pressable
            key={valeur}
            accessibilityRole="button"
            accessibilityLabel={`${valeur} étoile${valeur > 1 ? 's' : ''}`}
            accessibilityState={{ selected: remplie }}
            hitSlop={6}
            onPress={() => onChange(valeur)}
            testID={`etoile-${valeur}`}>
            {etoile}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  ligne: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  etoile: {
    marginRight: 2,
  },
});
