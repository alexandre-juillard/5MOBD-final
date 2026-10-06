import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Bouton } from '@/components/button';
import { EtatVide } from '@/components/empty-state';
import { CarteAvis } from '@/components/review-card';
import { FormulaireAvis } from '@/components/review-form';
import { NoteEtoiles } from '@/components/star-rating';
import { BadgeVisibilite } from '@/components/visibility-badge';
import { couleurs, espacements, rayons } from '@/constants/theme';
import { useAuthentification } from '@/context/auth-context';
import { recupererAdresse, supprimerAdresse } from '@/services/address-service';
import { ecouterAvis, enregistrerAvis, supprimerAvis } from '@/services/review-service';
import type { Adresse, Avis, NouvelAvis } from '@/types/models';
import { confirmer, informer } from '@/utils/dialogs';
import { traduireErreur } from '@/utils/errors';
import { calculerNoteMoyenne, formaterDate, formaterNoteMoyenne } from '@/utils/format';
import { choisirImage } from '@/utils/image-picker';

export default function EcranDetailAdresse() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const routeur = useRouter();
  const { utilisateur, profil } = useAuthentification();
  const [resultat, definirResultat] = useState<{ id: string; adresse: Adresse | null } | null>(null);
  const [listeAvis, definirListeAvis] = useState<Avis[]>([]);
  const [enregistrementAvis, definirEnregistrementAvis] = useState(false);
  const [suppression, definirSuppression] = useState(false);
  const chargement = resultat?.id !== id;
  const adresse = resultat && resultat.id === id ? resultat.adresse : null;

  useEffect(() => {
    let actif = true;
    recupererAdresse(id)
      .catch(() => null)
      .then((adresseTrouvee) => {
        if (actif) {
          definirResultat({ id, adresse: adresseTrouvee });
        }
      });
    return () => {
      actif = false;
    };
  }, [id]);

  useEffect(() => {
    if (!adresse) {
      return;
    }
    return ecouterAvis(adresse.id, definirListeAvis, () => definirListeAvis([]));
  }, [adresse]);

  if (chargement) {
    return <EtatVide titre="Chargement..." chargement testID="detail-chargement" />;
  }

  if (!adresse) {
    return (
      <EtatVide
        icone="🔒"
        titre="Adresse introuvable"
        message="Cette adresse n'existe plus ou n'est pas accessible."
        testID="detail-introuvable"
      />
    );
  }

  const estProprietaire = adresse.proprietaireId === utilisateur?.uid;
  const monAvis = listeAvis.find((avis) => avis.auteurId === utilisateur?.uid) ?? null;
  const peutDonnerAvis = adresse.estPublique && !estProprietaire && Boolean(profil);

  const supprimer = async () => {
    const accepte = await confirmer(
      "Supprimer l'adresse",
      `Voulez-vous vraiment supprimer « ${adresse.nom} » ? Cette action est définitive.`,
      'Supprimer',
    );
    if (!accepte) {
      return;
    }
    definirSuppression(true);
    try {
      await supprimerAdresse(adresse);
      routeur.back();
    } catch (erreur) {
      informer('Suppression impossible', traduireErreur(erreur));
      definirSuppression(false);
    }
  };

  const publierAvis = async (nouvelAvis: NouvelAvis) => {
    if (!profil) {
      return;
    }
    definirEnregistrementAvis(true);
    try {
      await enregistrerAvis(adresse.id, profil, nouvelAvis);
    } catch (erreur) {
      informer('Avis', traduireErreur(erreur));
    } finally {
      definirEnregistrementAvis(false);
    }
  };

  const retirerAvis = async (avis: Avis) => {
    if (await confirmer("Supprimer l'avis", 'Voulez-vous vraiment supprimer cet avis ?', 'Supprimer')) {
      try {
        await supprimerAvis(adresse.id, avis);
      } catch (erreur) {
        informer('Avis', traduireErreur(erreur));
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.contenu} testID="ecran-detail-adresse">
      <Stack.Screen options={{ title: adresse.nom }} />
      {adresse.photoUrl ? (
        <Image source={{ uri: adresse.photoUrl }} style={styles.photo} accessibilityLabel={`Photo de ${adresse.nom}`} />
      ) : null}
      <View style={styles.carte}>
        <View style={styles.entete}>
          <Text style={styles.nom} testID="detail-nom">
            {adresse.nom}
          </Text>
          <BadgeVisibilite estPublique={adresse.estPublique} />
        </View>
        {adresse.estPublique ? (
          <View style={styles.note}>
            <NoteEtoiles note={calculerNoteMoyenne(listeAvis)} taille={18} />
            <Text style={styles.texteNote} testID="detail-note-moyenne">
              {formaterNoteMoyenne(listeAvis)}
            </Text>
          </View>
        ) : null}
        {adresse.description ? <Text style={styles.description}>{adresse.description}</Text> : null}
        {adresse.adresseTexte ? <Text style={styles.meta}>📍 {adresse.adresseTexte}</Text> : null}
        <Text style={styles.meta}>
          {estProprietaire ? 'Ajoutée par vous' : `Partagée par ${adresse.proprietaireNom}`}
          {adresse.creeLe ? ` le ${formaterDate(adresse.creeLe)}` : ''}
        </Text>
        {estProprietaire ? (
          <Bouton
            libelle="Supprimer cette adresse"
            variante="danger"
            onPress={supprimer}
            chargement={suppression}
            style={styles.boutonSupprimer}
            testID="bouton-supprimer-adresse"
          />
        ) : null}
      </View>

      {peutDonnerAvis ? (
        <FormulaireAvis
          key={monAvis ? `avis-${monAvis.id}` : 'nouvel-avis'}
          avisExistant={monAvis}
          enregistrement={enregistrementAvis}
          choisirPhoto={choisirImage}
          onSoumettre={publierAvis}
        />
      ) : null}

      {adresse.estPublique ? (
        <View>
          <Text style={styles.titreSection}>Avis ({listeAvis.length})</Text>
          {estProprietaire ? (
            <Text style={styles.aide}>Vous ne pouvez pas noter votre propre adresse.</Text>
          ) : null}
          {listeAvis.length === 0 ? (
            <Text style={styles.aide} testID="aucun-avis">
              Aucun avis pour le moment.
            </Text>
          ) : (
            listeAvis.map((avis) => (
              <CarteAvis
                key={avis.id}
                avis={avis}
                peutSupprimer={avis.auteurId === utilisateur?.uid || estProprietaire}
                onSupprimer={retirerAvis}
              />
            ))
          )}
        </View>
      ) : (
        <Text style={styles.aide}>Cette adresse est privée : elle n&apos;est visible que par vous.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenu: {
    padding: espacements.m,
    paddingBottom: espacements.xl,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  photo: {
    width: '100%',
    height: 240,
    borderRadius: rayons.m,
    backgroundColor: couleurs.bordure,
    marginBottom: espacements.m,
  },
  carte: {
    backgroundColor: couleurs.surface,
    borderRadius: rayons.m,
    padding: espacements.m,
    marginBottom: espacements.m,
    gap: espacements.s,
  },
  entete: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espacements.s,
  },
  nom: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    color: couleurs.texte,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacements.s,
  },
  texteNote: {
    color: couleurs.texteSecondaire,
    fontWeight: '600',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: couleurs.texte,
  },
  meta: {
    fontSize: 13,
    color: couleurs.texteSecondaire,
  },
  boutonSupprimer: {
    marginTop: espacements.s,
  },
  titreSection: {
    fontSize: 18,
    fontWeight: '700',
    color: couleurs.texte,
    marginBottom: espacements.s,
  },
  aide: {
    color: couleurs.texteSecondaire,
    marginBottom: espacements.s,
  },
});
