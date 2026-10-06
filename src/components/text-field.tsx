import { forwardRef } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { couleurs, espacements, rayons } from '@/constants/theme';

export type ProprietesChampTexte = TextInputProps & {
  libelle: string;
  erreur?: string;
};

export const ChampTexte = forwardRef<TextInput, ProprietesChampTexte>(function ChampTexte(
  { libelle, erreur, style, testID, multiline, ...proprietes },
  reference,
) {
  return (
    <View style={styles.conteneur}>
      <Text style={styles.libelle}>{libelle}</Text>
      <TextInput
        ref={reference}
        accessibilityLabel={libelle}
        placeholderTextColor={couleurs.texteSecondaire}
        testID={testID}
        multiline={multiline}
        style={[styles.champ, multiline && styles.multiligne, Boolean(erreur) && styles.champErreur, style]}
        {...proprietes}
      />
      {erreur ? (
        <Text style={styles.erreur} testID={testID ? `${testID}-erreur` : undefined}>
          {erreur}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  conteneur: {
    marginBottom: espacements.m,
  },
  libelle: {
    fontSize: 14,
    fontWeight: '600',
    color: couleurs.texte,
    marginBottom: espacements.xs,
  },
  champ: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    borderRadius: rayons.m,
    backgroundColor: couleurs.surface,
    paddingHorizontal: espacements.m,
    paddingVertical: espacements.s,
    fontSize: 16,
    color: couleurs.texte,
  },
  multiligne: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  champErreur: {
    borderColor: couleurs.erreur,
  },
  erreur: {
    marginTop: espacements.xs,
    color: couleurs.erreur,
    fontSize: 13,
  },
});
