import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CarteAdresses } from '@/components/map/address-map';
import type { MarqueurCarte } from '@/components/map/types';
import { couleurs, espacements, rayons } from '@/constants/theme';
import { useAdressesPubliques, useMesAdresses } from '@/hooks/use-addresses';
import { useLocalisation } from '@/hooks/use-location';

export default function EcranCarte() {
  const routeur = useRouter();
  const { position, autorisationRefusee, actualiser } = useLocalisation();
  const { adresses: mesAdresses } = useMesAdresses();
  const { adresses: adressesPubliques } = useAdressesPubliques();

  const marqueurs = useMemo<MarqueurCarte[]>(
    () => [
      ...mesAdresses.map((adresse) => ({
        id: adresse.id,
        titre: adresse.nom,
        description: adresse.description,
        latitude: adresse.latitude,
        longitude: adresse.longitude,
        estPersonnel: true,
      })),
      ...adressesPubliques.map((adresse) => ({
        id: adresse.id,
        titre: adresse.nom,
        description: `Par ${adresse.proprietaireNom}`,
        latitude: adresse.latitude,
        longitude: adresse.longitude,
        estPersonnel: false,
      })),
    ],
    [mesAdresses, adressesPubliques],
  );

  return (
    <View style={styles.ecran} testID="ecran-carte">
      <CarteAdresses
        position={position}
        marqueurs={marqueurs}
        onSelection={(id) => routeur.push({ pathname: '/address/[id]', params: { id } })}
      />
      <View style={styles.legende} pointerEvents="none">
        <View style={styles.elementLegende}>
          <View style={[styles.pastille, { backgroundColor: couleurs.marqueurPerso }]} />
          <Text style={styles.texteLegende}>Mes adresses</Text>
        </View>
        <View style={styles.elementLegende}>
          <View style={[styles.pastille, { backgroundColor: couleurs.marqueurPublic }]} />
          <Text style={styles.texteLegende}>Publiques</Text>
        </View>
      </View>
      {autorisationRefusee ? (
        <Pressable style={styles.bandeau} onPress={actualiser} testID="bandeau-localisation">
          <Text style={styles.texteBandeau}>
            Localisation indisponible : carte centrée sur Paris. Appuyez pour réessayer.
          </Text>
        </Pressable>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ajouter une adresse"
        onPress={() => routeur.push('/address/new')}
        style={({ pressed }) => [styles.boutonAjout, pressed && styles.appuye]}
        testID="bouton-ajouter-adresse">
        <Text style={styles.texteAjout}>＋</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  ecran: {
    flex: 1,
  },
  legende: {
    position: 'absolute',
    top: espacements.m,
    left: espacements.m,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: rayons.m,
    padding: espacements.s,
    gap: 4,
    zIndex: 1000,
  },
  elementLegende: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacements.xs,
  },
  pastille: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  texteLegende: {
    fontSize: 12,
    color: couleurs.texte,
  },
  bandeau: {
    position: 'absolute',
    bottom: espacements.l,
    left: espacements.m,
    right: 96,
    backgroundColor: couleurs.texte,
    borderRadius: rayons.m,
    padding: espacements.s,
    zIndex: 1000,
  },
  texteBandeau: {
    color: couleurs.blanc,
    fontSize: 13,
  },
  boutonAjout: {
    position: 'absolute',
    bottom: espacements.l,
    right: espacements.l,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: couleurs.primaire,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.25)',
    zIndex: 1000,
  },
  appuye: {
    opacity: 0.85,
  },
  texteAjout: {
    color: couleurs.blanc,
    fontSize: 32,
    lineHeight: 34,
    fontWeight: '600',
  },
});
