import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Bouton } from '@/components/button';
import { SelecteurEmplacement } from '@/components/map/location-picker-map';
import { SelecteurPhoto } from '@/components/photo-picker';
import { ChampTexte } from '@/components/text-field';
import { SelecteurVisibilite } from '@/components/visibility-switch';
import { couleurs, espacements, rayons } from '@/constants/theme';
import { useAuthentification } from '@/context/auth-context';
import { obtenirPositionActuelle } from '@/hooks/use-location';
import { creerAdresse } from '@/services/address-service';
import { obtenirAdresseDepuisCoordonnees, rechercherAdresse } from '@/services/geocoding-service';
import type { Coordonnees, ResultatGeocodage } from '@/types/models';
import { informer } from '@/utils/dialogs';
import { traduireErreur } from '@/utils/errors';
import { choisirImage, type SourceImage } from '@/utils/image-picker';
import { estFormulaireValide, validerAdresse, type ChampsAdresse, type ErreursFormulaire } from '@/utils/validation';

export default function EcranNouvelleAdresse() {
  const routeur = useRouter();
  const { profil } = useAuthentification();
  const [nom, definirNom] = useState('');
  const [description, definirDescription] = useState('');
  const [estPublique, definirEstPublique] = useState(false);
  const [photoUri, definirPhotoUri] = useState<string | null>(null);
  const [emplacement, definirEmplacement] = useState<Coordonnees | null>(null);
  const [centreCarte, definirCentreCarte] = useState<Coordonnees | null>(null);
  const [adresseTexte, definirAdresseTexte] = useState('');
  const [recherche, definirRecherche] = useState('');
  const [resultats, definirResultats] = useState<ResultatGeocodage[]>([]);
  const [rechercheEnCours, definirRechercheEnCours] = useState(false);
  const [localisationEnCours, definirLocalisationEnCours] = useState(false);
  const [erreurs, definirErreurs] = useState<ErreursFormulaire<ChampsAdresse>>({});
  const [enregistrement, definirEnregistrement] = useState(false);

  useEffect(() => {
    let actif = true;
    obtenirPositionActuelle()
      .then((position) => {
        if (actif && position) {
          definirCentreCarte(position);
        }
      })
      .catch(() => undefined);
    return () => {
      actif = false;
    };
  }, []);

  const placerEmplacement = async (coordonnees: Coordonnees, libelle?: string) => {
    definirEmplacement(coordonnees);
    definirErreurs((precedentes) => ({ ...precedentes, emplacement: undefined }));
    definirAdresseTexte(libelle ?? (await obtenirAdresseDepuisCoordonnees(coordonnees)));
  };

  const lancerRecherche = async () => {
    definirRechercheEnCours(true);
    try {
      const trouves = await rechercherAdresse(recherche);
      definirResultats(trouves);
      if (trouves.length === 0) {
        informer('Recherche', 'Aucun résultat pour cette adresse.');
      }
    } catch {
      informer('Recherche', 'La recherche est indisponible pour le moment.');
    } finally {
      definirRechercheEnCours(false);
    }
  };

  const choisirResultat = (resultat: ResultatGeocodage) => {
    definirResultats([]);
    definirRecherche(resultat.libelle);
    definirCentreCarte({ latitude: resultat.latitude, longitude: resultat.longitude });
    placerEmplacement({ latitude: resultat.latitude, longitude: resultat.longitude }, resultat.libelle);
  };

  const utiliserMaPosition = async () => {
    definirLocalisationEnCours(true);
    try {
      const position = await obtenirPositionActuelle();
      if (!position) {
        informer('Localisation', "Impossible d'obtenir votre position. Vérifiez les autorisations.");
        return;
      }
      definirCentreCarte(position);
      await placerEmplacement(position);
    } finally {
      definirLocalisationEnCours(false);
    }
  };

  const selectionnerPhoto = async (source: SourceImage) => {
    const uri = await choisirImage(source);
    if (uri) {
      definirPhotoUri(uri);
    }
  };

  const enregistrer = async () => {
    const nouvellesErreurs = validerAdresse(nom, description, Boolean(emplacement));
    definirErreurs(nouvellesErreurs);
    if (!estFormulaireValide(nouvellesErreurs) || !emplacement || !profil) {
      return;
    }
    definirEnregistrement(true);
    try {
      await creerAdresse(profil, { nom, description, estPublique, photoUri, adresseTexte, ...emplacement });
      routeur.back();
    } catch (erreur) {
      informer('Enregistrement impossible', traduireErreur(erreur));
      definirEnregistrement(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.ecran} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.contenu} keyboardShouldPersistTaps="handled" testID="ecran-nouvelle-adresse">
        <ChampTexte
          libelle="Nom"
          placeholder="Ex : La boulangerie du coin"
          value={nom}
          onChangeText={definirNom}
          maxLength={80}
          erreur={erreurs.nom}
          testID="champ-nom-adresse"
        />
        <ChampTexte
          libelle="Description"
          placeholder="Ce que vous aimez à cet endroit..."
          value={description}
          onChangeText={definirDescription}
          multiline
          maxLength={500}
          erreur={erreurs.description}
          testID="champ-description"
        />
        <Text style={styles.titreSection}>Visibilité</Text>
        <SelecteurVisibilite estPublique={estPublique} onChange={definirEstPublique} />
        <Text style={styles.titreSection}>Emplacement</Text>
        <View style={styles.ligneRecherche}>
          <View style={styles.champRecherche}>
            <ChampTexte
              libelle="Rechercher une adresse"
              placeholder="Ex : 10 rue de Rivoli, Paris"
              value={recherche}
              onChangeText={definirRecherche}
              onSubmitEditing={lancerRecherche}
              returnKeyType="search"
              testID="champ-recherche-adresse"
            />
          </View>
          <Bouton
            libelle="Chercher"
            variante="secondaire"
            onPress={lancerRecherche}
            chargement={rechercheEnCours}
            desactive={recherche.trim().length < 3}
            style={styles.boutonRecherche}
            testID="bouton-rechercher-adresse"
          />
        </View>
        {resultats.map((resultat, index) => (
          <Pressable
            key={`${resultat.latitude}-${resultat.longitude}-${index}`}
            onPress={() => choisirResultat(resultat)}
            style={styles.resultat}
            testID={`resultat-recherche-${index}`}>
            <Text numberOfLines={2} style={styles.texteResultat}>
              {resultat.libelle}
            </Text>
          </Pressable>
        ))}
        <Bouton
          libelle="📍 Utiliser ma position actuelle"
          variante="lien"
          onPress={utiliserMaPosition}
          chargement={localisationEnCours}
          testID="bouton-ma-position"
        />
        {emplacement ? (
          <Text style={styles.emplacementChoisi} testID="emplacement-choisi">
            ✓ {adresseTexte || `${emplacement.latitude.toFixed(5)}, ${emplacement.longitude.toFixed(5)}`}
          </Text>
        ) : null}
        {erreurs.emplacement ? (
          <Text style={styles.erreur} testID="emplacement-erreur">
            {erreurs.emplacement}
          </Text>
        ) : null}
        <Text style={styles.aide}>Ou appuyez directement sur la carte pour placer le repère.</Text>
        <SelecteurEmplacement
          emplacement={emplacement}
          centre={centreCarte}
          onChange={(coordonnees) => placerEmplacement(coordonnees)}
          style={styles.carte}
        />
        <SelecteurPhoto
          libelle="Photo (facultative)"
          uri={photoUri}
          onChoisir={selectionnerPhoto}
          onRetirer={() => definirPhotoUri(null)}
          desactive={enregistrement}
          testID="photo-adresse"
        />
      </ScrollView>
      <View style={styles.pied}>
        <Bouton
          libelle="Enregistrer l'adresse"
          onPress={enregistrer}
          chargement={enregistrement}
          desactive={!profil}
          testID="bouton-enregistrer-adresse"
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  ecran: {
    flex: 1,
    backgroundColor: couleurs.fond,
  },
  contenu: {
    padding: espacements.m,
    paddingBottom: espacements.xl,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  titreSection: {
    fontSize: 14,
    fontWeight: '600',
    color: couleurs.texte,
    marginBottom: espacements.xs,
  },
  ligneRecherche: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espacements.s,
  },
  champRecherche: {
    flex: 1,
  },
  boutonRecherche: {
    marginTop: 22,
    paddingHorizontal: espacements.m,
  },
  resultat: {
    backgroundColor: couleurs.surface,
    borderRadius: rayons.s,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    padding: espacements.s,
    marginBottom: espacements.xs,
  },
  texteResultat: {
    color: couleurs.texte,
  },
  aide: {
    color: couleurs.texteSecondaire,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: espacements.s,
  },
  emplacementChoisi: {
    color: couleurs.succes,
    fontWeight: '600',
    marginBottom: espacements.s,
  },
  erreur: {
    color: couleurs.erreur,
    marginBottom: espacements.s,
  },
  carte: {
    marginBottom: espacements.m,
  },
  pied: {
    padding: espacements.m,
    borderTopWidth: 1,
    borderTopColor: couleurs.bordure,
    backgroundColor: couleurs.surface,
  },
});
