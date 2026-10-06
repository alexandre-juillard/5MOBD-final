import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { couleurs, espacements } from '@/constants/theme';

export type ProprietesEtatVide = {
  titre: string;
  message?: string;
  icone?: string;
  chargement?: boolean;
  testID?: string;
};

export function EtatVide({ titre, message, icone = '🗺️', chargement = false, testID }: ProprietesEtatVide) {
  return (
    <View style={styles.conteneur} testID={testID}>
      {chargement ? (
        <ActivityIndicator size="large" color={couleurs.primaire} />
      ) : (
        <Text style={styles.icone}>{icone}</Text>
      )}
      <Text style={styles.titre}>{titre}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espacements.xl,
  },
  icone: {
    fontSize: 48,
  },
  titre: {
    marginTop: espacements.m,
    fontSize: 18,
    fontWeight: '700',
    color: couleurs.texte,
    textAlign: 'center',
  },
  message: {
    marginTop: espacements.s,
    fontSize: 15,
    color: couleurs.texteSecondaire,
    textAlign: 'center',
  },
});
