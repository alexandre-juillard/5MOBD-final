import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { couleurs, espacements, rayons } from '@/constants/theme';
import type { Adresse } from '@/types/models';

import { BadgeVisibilite } from './visibility-badge';

export type ProprietesCarteAdresse = {
  adresse: Adresse;
  onPress: (adresse: Adresse) => void;
  afficherProprietaire?: boolean;
};

export function CarteAdresse({ adresse, onPress, afficherProprietaire = false }: ProprietesCarteAdresse) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Voir ${adresse.nom}`}
      onPress={() => onPress(adresse)}
      style={({ pressed }) => [styles.carte, pressed && styles.appuyee]}
      testID={`carte-adresse-${adresse.id}`}>
      {adresse.photoUrl ? (
        <Image source={{ uri: adresse.photoUrl }} style={styles.photo} accessibilityLabel={`Photo de ${adresse.nom}`} />
      ) : (
        <View style={[styles.photo, styles.photoVide]}>
          <Text style={styles.photoVideTexte}>📍</Text>
        </View>
      )}
      <View style={styles.contenu}>
        <View style={styles.entete}>
          <Text style={styles.nom} numberOfLines={1}>
            {adresse.nom}
          </Text>
          <BadgeVisibilite estPublique={adresse.estPublique} />
        </View>
        {adresse.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {adresse.description}
          </Text>
        ) : null}
        {adresse.adresseTexte ? (
          <Text style={styles.adresseTexte} numberOfLines={1}>
            {adresse.adresseTexte}
          </Text>
        ) : null}
        {afficherProprietaire ? <Text style={styles.proprietaire}>Partagée par {adresse.proprietaireNom}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  carte: {
    flexDirection: 'row',
    backgroundColor: couleurs.surface,
    borderRadius: rayons.m,
    padding: espacements.s,
    marginBottom: espacements.s,
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.06)',
  },
  appuyee: {
    opacity: 0.85,
  },
  photo: {
    width: 84,
    height: 84,
    borderRadius: rayons.s,
    backgroundColor: couleurs.bordure,
  },
  photoVide: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoVideTexte: {
    fontSize: 28,
  },
  contenu: {
    flex: 1,
    marginLeft: espacements.m,
    justifyContent: 'center',
    gap: 4,
  },
  entete: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacements.s,
  },
  nom: {
    flexShrink: 1,
    fontSize: 16,
    fontWeight: '700',
    color: couleurs.texte,
  },
  description: {
    fontSize: 14,
    color: couleurs.texte,
  },
  adresseTexte: {
    fontSize: 12,
    color: couleurs.texteSecondaire,
  },
  proprietaire: {
    fontSize: 12,
    color: couleurs.secondaire,
    fontWeight: '600',
  },
});
