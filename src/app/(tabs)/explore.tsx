import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Keyboard, StyleSheet, TextInput, View } from 'react-native';

import { CarteAdresse } from '@/components/address-card';
import { EtatVide } from '@/components/empty-state';
import { couleurs, espacements, rayons } from '@/constants/theme';
import { useAdressesPubliques } from '@/hooks/use-addresses';
import { rechercherDansAdresses } from '@/utils/filters';

export default function EcranExplorer() {
  const routeur = useRouter();
  const { adresses, chargement, erreur } = useAdressesPubliques();
  const [recherche, definirRecherche] = useState('');
  const resultats = useMemo(() => rechercherDansAdresses(adresses, recherche), [adresses, recherche]);

  return (
    <View style={styles.ecran} testID="ecran-explorer">
      <View style={styles.zoneRecherche}>
        <TextInput
          value={recherche}
          onChangeText={definirRecherche}
          placeholder="Rechercher une adresse publique..."
          placeholderTextColor={couleurs.texteSecondaire}
          style={styles.recherche}
          accessibilityLabel="Rechercher une adresse publique"
          testID="champ-recherche"
        />
      </View>
      <FlatList
        data={resultats}
        keyboardShouldPersistTaps="handled"
        keyExtractor={(adresse) => adresse.id}
        renderItem={({ item }) => (
          <CarteAdresse
            adresse={item}
            afficherProprietaire
            onPress={(adresse) => {
              Keyboard.dismiss();
              routeur.push({ pathname: '/address/[id]', params: { id: adresse.id } });
            }}
          />
        )}
        contentContainerStyle={styles.liste}
        ListEmptyComponent={
          <EtatVide
            icone="🧭"
            chargement={chargement}
            titre={chargement ? 'Chargement...' : erreur ?? 'Aucune adresse publique'}
            message={
              chargement || erreur ? undefined : 'Les adresses partagées par les autres utilisateurs apparaîtront ici.'
            }
            testID="liste-vide"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  ecran: {
    flex: 1,
  },
  zoneRecherche: {
    padding: espacements.m,
    paddingBottom: espacements.s,
  },
  recherche: {
    minHeight: 44,
    borderRadius: rayons.rond,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    backgroundColor: couleurs.surface,
    paddingHorizontal: espacements.m,
    fontSize: 15,
    color: couleurs.texte,
  },
  liste: {
    flexGrow: 1,
    paddingHorizontal: espacements.m,
  },
});
