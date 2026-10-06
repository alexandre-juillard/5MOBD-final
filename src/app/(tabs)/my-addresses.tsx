import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { CarteAdresse } from '@/components/address-card';
import { Bouton } from '@/components/button';
import { EtatVide } from '@/components/empty-state';
import { couleurs, espacements, rayons } from '@/constants/theme';
import { useMesAdresses } from '@/hooks/use-addresses';
import type { Adresse } from '@/types/models';
import { filtrerParVisibilite, type FiltreVisibilite } from '@/utils/filters';

const filtres: { valeur: FiltreVisibilite; libelle: string }[] = [
  { valeur: 'toutes', libelle: 'Toutes' },
  { valeur: 'publiques', libelle: 'Publiques' },
  { valeur: 'privees', libelle: 'Privées' },
];

export default function EcranMesAdresses() {
  const routeur = useRouter();
  const { adresses, chargement, erreur } = useMesAdresses();
  const [filtre, definirFiltre] = useState<FiltreVisibilite>('toutes');
  const adressesFiltrees = useMemo(() => filtrerParVisibilite(adresses, filtre), [adresses, filtre]);

  const ouvrirAdresse = (adresse: Adresse) => routeur.push({ pathname: '/address/[id]', params: { id: adresse.id } });

  return (
    <View style={styles.ecran} testID="ecran-mes-adresses">
      <View style={styles.filtres}>
        {filtres.map((option) => {
          const actif = option.valeur === filtre;
          return (
            <Pressable
              key={option.valeur}
              accessibilityRole="button"
              accessibilityState={{ selected: actif }}
              onPress={() => definirFiltre(option.valeur)}
              style={[styles.filtre, actif && styles.filtreActif]}
              testID={`filtre-${option.valeur}`}>
              <Text style={[styles.texteFiltre, actif && styles.texteFiltreActif]}>{option.libelle}</Text>
            </Pressable>
          );
        })}
      </View>
      <FlatList
        data={adressesFiltrees}
        keyExtractor={(adresse) => adresse.id}
        renderItem={({ item }) => <CarteAdresse adresse={item} onPress={ouvrirAdresse} />}
        contentContainerStyle={styles.liste}
        ListEmptyComponent={
          <EtatVide
            chargement={chargement}
            titre={chargement ? 'Chargement...' : erreur ?? 'Aucune adresse'}
            message={chargement || erreur ? undefined : 'Ajoutez votre première bonne adresse !'}
            testID="liste-vide"
          />
        }
      />
      <View style={styles.pied}>
        <Bouton
          libelle="Ajouter une adresse"
          onPress={() => routeur.push('/address/new')}
          testID="bouton-nouvelle-adresse"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ecran: {
    flex: 1,
  },
  filtres: {
    flexDirection: 'row',
    gap: espacements.s,
    padding: espacements.m,
    paddingBottom: espacements.s,
  },
  filtre: {
    paddingHorizontal: espacements.m,
    paddingVertical: espacements.xs + 2,
    borderRadius: rayons.rond,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    backgroundColor: couleurs.surface,
  },
  filtreActif: {
    backgroundColor: couleurs.texte,
    borderColor: couleurs.texte,
  },
  texteFiltre: {
    color: couleurs.texte,
    fontWeight: '600',
  },
  texteFiltreActif: {
    color: couleurs.blanc,
  },
  liste: {
    flexGrow: 1,
    paddingHorizontal: espacements.m,
  },
  pied: {
    padding: espacements.m,
  },
});
