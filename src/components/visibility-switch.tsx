import { Pressable, StyleSheet, Text, View } from 'react-native';

import { couleurs, espacements, rayons } from '@/constants/theme';

export type ProprietesSelecteurVisibilite = {
  estPublique: boolean;
  onChange: (estPublique: boolean) => void;
};

const options = [
  { valeur: false, libelle: 'Privée', description: 'Visible par vous seul', testID: 'option-privee' },
  { valeur: true, libelle: 'Publique', description: 'Visible par tous', testID: 'option-publique' },
];

export function SelecteurVisibilite({ estPublique, onChange }: ProprietesSelecteurVisibilite) {
  return (
    <View style={styles.conteneur} accessibilityRole="radiogroup">
      {options.map((option) => {
        const selectionne = option.valeur === estPublique;
        return (
          <Pressable
            key={option.libelle}
            accessibilityRole="radio"
            accessibilityState={{ checked: selectionne }}
            accessibilityLabel={option.libelle}
            onPress={() => onChange(option.valeur)}
            testID={option.testID}
            style={[styles.option, selectionne && styles.optionSelectionnee]}>
            <Text style={[styles.libelle, selectionne && styles.libelleSelectionne]}>{option.libelle}</Text>
            <Text style={[styles.description, selectionne && styles.libelleSelectionne]}>{option.description}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    flexDirection: 'row',
    gap: espacements.s,
    marginBottom: espacements.m,
  },
  option: {
    flex: 1,
    padding: espacements.m,
    borderRadius: rayons.m,
    borderWidth: 1.5,
    borderColor: couleurs.bordure,
    backgroundColor: couleurs.surface,
  },
  optionSelectionnee: {
    borderColor: couleurs.primaire,
    backgroundColor: couleurs.primaire,
  },
  libelle: {
    fontSize: 16,
    fontWeight: '700',
    color: couleurs.texte,
  },
  description: {
    fontSize: 12,
    color: couleurs.texteSecondaire,
    marginTop: 2,
  },
  libelleSelectionne: {
    color: couleurs.blanc,
  },
});
