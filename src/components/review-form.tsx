import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { couleurs, espacements, rayons } from '@/constants/theme';
import type { Avis, NouvelAvis } from '@/types/models';
import type { SourceImage } from '@/utils/image-picker';
import { estFormulaireValide, validerAvis, type ChampsAvis, type ErreursFormulaire } from '@/utils/validation';

import { Bouton } from './button';
import { SelecteurPhoto } from './photo-picker';
import { NoteEtoiles } from './star-rating';
import { ChampTexte } from './text-field';

export type ProprietesFormulaireAvis = {
  avisExistant?: Avis | null;
  enregistrement?: boolean;
  choisirPhoto: (source: SourceImage) => Promise<string | null>;
  onSoumettre: (avis: NouvelAvis) => void;
};

export function FormulaireAvis({
  avisExistant = null,
  enregistrement = false,
  choisirPhoto,
  onSoumettre,
}: ProprietesFormulaireAvis) {
  const [note, definirNote] = useState(avisExistant?.note ?? 0);
  const [commentaire, definirCommentaire] = useState(avisExistant?.commentaire ?? '');
  const [photoUri, definirPhotoUri] = useState<string | null>(null);
  const [photoUrlExistante, definirPhotoUrlExistante] = useState<string | null>(avisExistant?.photoUrl ?? null);
  const [erreurs, definirErreurs] = useState<ErreursFormulaire<ChampsAvis>>({});

  const selectionnerPhoto = async (source: SourceImage) => {
    const uri = await choisirPhoto(source);
    if (uri) {
      definirPhotoUri(uri);
    }
  };

  const retirerPhoto = () => {
    definirPhotoUri(null);
    definirPhotoUrlExistante(null);
  };

  const soumettre = () => {
    const nouvellesErreurs = validerAvis(note, commentaire, Boolean(photoUri || photoUrlExistante));
    definirErreurs(nouvellesErreurs);
    if (!estFormulaireValide(nouvellesErreurs)) {
      return;
    }
    onSoumettre({ note, commentaire, photoUri, photoUrlExistante });
  };

  return (
    <View style={styles.conteneur} testID="formulaire-avis">
      <Text style={styles.titre}>{avisExistant ? 'Modifier mon avis' : 'Donner mon avis'}</Text>
      <View style={styles.note}>
        <NoteEtoiles note={note} onChange={definirNote} taille={34} testID="selection-note" />
        {erreurs.note ? (
          <Text style={styles.erreur} testID="note-erreur">
            {erreurs.note}
          </Text>
        ) : null}
      </View>
      <ChampTexte
        libelle="Commentaire"
        placeholder="Partagez votre expérience..."
        value={commentaire}
        onChangeText={definirCommentaire}
        multiline
        maxLength={1000}
        erreur={erreurs.commentaire}
        testID="champ-commentaire"
      />
      <SelecteurPhoto
        libelle="Photo (facultative)"
        uri={photoUri ?? photoUrlExistante}
        onChoisir={selectionnerPhoto}
        onRetirer={retirerPhoto}
        desactive={enregistrement}
        testID="photo-avis"
      />
      <Bouton
        libelle={avisExistant ? 'Mettre à jour mon avis' : 'Publier mon avis'}
        onPress={soumettre}
        chargement={enregistrement}
        testID="bouton-publier-avis"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    backgroundColor: couleurs.surface,
    borderRadius: rayons.m,
    padding: espacements.m,
    marginBottom: espacements.m,
  },
  titre: {
    fontSize: 18,
    fontWeight: '700',
    color: couleurs.texte,
    marginBottom: espacements.s,
  },
  note: {
    marginBottom: espacements.m,
  },
  erreur: {
    color: couleurs.erreur,
    fontSize: 13,
    marginTop: espacements.xs,
  },
});
