import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { couleurs, espacements, rayons } from '@/constants/theme';
import type { Avis } from '@/types/models';
import { formaterDate } from '@/utils/format';

import { Avatar } from './avatar';
import { NoteEtoiles } from './star-rating';

export type ProprietesCarteAvis = {
  avis: Avis;
  peutSupprimer?: boolean;
  onSupprimer?: (avis: Avis) => void;
};

export function CarteAvis({ avis, peutSupprimer = false, onSupprimer }: ProprietesCarteAvis) {
  return (
    <View style={styles.carte} testID={`avis-${avis.id}`}>
      <View style={styles.entete}>
        <Avatar uri={avis.auteurPhotoUrl} nom={avis.auteurNom} taille={36} />
        <View style={styles.auteur}>
          <Text style={styles.nom}>{avis.auteurNom}</Text>
          <Text style={styles.date}>{formaterDate(avis.creeLe)}</Text>
        </View>
        <NoteEtoiles note={avis.note} taille={16} />
      </View>
      {avis.commentaire ? <Text style={styles.commentaire}>{avis.commentaire}</Text> : null}
      {avis.photoUrl ? (
        <Image source={{ uri: avis.photoUrl }} style={styles.photo} accessibilityLabel="Photo de l'avis" />
      ) : null}
      {peutSupprimer && onSupprimer ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Supprimer l'avis"
          onPress={() => onSupprimer(avis)}
          style={styles.supprimer}
          testID={`supprimer-avis-${avis.id}`}>
          <Text style={styles.supprimerTexte}>Supprimer</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  carte: {
    backgroundColor: couleurs.surface,
    borderRadius: rayons.m,
    padding: espacements.m,
    marginBottom: espacements.s,
    borderWidth: 1,
    borderColor: couleurs.bordure,
  },
  entete: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  auteur: {
    flex: 1,
    marginLeft: espacements.s,
  },
  nom: {
    fontWeight: '700',
    color: couleurs.texte,
  },
  date: {
    fontSize: 12,
    color: couleurs.texteSecondaire,
  },
  commentaire: {
    marginTop: espacements.s,
    fontSize: 15,
    color: couleurs.texte,
    lineHeight: 21,
  },
  photo: {
    marginTop: espacements.s,
    width: '100%',
    height: 160,
    borderRadius: rayons.s,
    backgroundColor: couleurs.bordure,
  },
  supprimer: {
    alignSelf: 'flex-end',
    marginTop: espacements.s,
  },
  supprimerTexte: {
    color: couleurs.erreur,
    fontWeight: '600',
  },
});
