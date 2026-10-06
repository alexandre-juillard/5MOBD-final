import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { Bouton } from '@/components/button';
import { SelecteurPhoto } from '@/components/photo-picker';
import { couleurs, espacements, rayons } from '@/constants/theme';
import { useAuthentification } from '@/context/auth-context';
import { useMesAdresses } from '@/hooks/use-addresses';
import { confirmer, informer } from '@/utils/dialogs';
import { traduireErreur } from '@/utils/errors';
import { choisirImage, type SourceImage } from '@/utils/image-picker';

export default function EcranProfil() {
  const { utilisateur, profil, seDeconnecter, changerPhotoProfil } = useAuthentification();
  const { adresses } = useMesAdresses();
  const [envoiPhoto, definirEnvoiPhoto] = useState(false);

  const nom = profil?.nom ?? utilisateur?.displayName ?? 'Utilisateur';
  const nombrePubliques = adresses.filter((adresse) => adresse.estPublique).length;

  const modifierPhoto = async (source: SourceImage) => {
    const uri = await choisirImage(source);
    if (!uri) {
      return;
    }
    definirEnvoiPhoto(true);
    try {
      await changerPhotoProfil(uri);
    } catch (erreur) {
      informer('Photo de profil', traduireErreur(erreur));
    } finally {
      definirEnvoiPhoto(false);
    }
  };

  const deconnecter = async () => {
    if (await confirmer('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', 'Se déconnecter')) {
      await seDeconnecter();
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.contenu} testID="ecran-profil">
      <View style={styles.entete}>
        <Avatar uri={profil?.photoUrl ?? null} nom={nom} taille={112} testID="avatar-profil" />
        <Text style={styles.nom} testID="nom-profil">
          {nom}
        </Text>
        <Text style={styles.email}>{utilisateur?.email}</Text>
      </View>
      <View style={styles.statistiques}>
        <View style={styles.statistique}>
          <Text style={styles.valeur}>{adresses.length}</Text>
          <Text style={styles.libelle}>Adresses</Text>
        </View>
        <View style={styles.statistique}>
          <Text style={styles.valeur}>{nombrePubliques}</Text>
          <Text style={styles.libelle}>Publiques</Text>
        </View>
        <View style={styles.statistique}>
          <Text style={styles.valeur}>{adresses.length - nombrePubliques}</Text>
          <Text style={styles.libelle}>Privées</Text>
        </View>
      </View>
      <View style={styles.carte}>
        <SelecteurPhoto
          libelle={envoiPhoto ? 'Envoi de la photo...' : 'Changer ma photo de profil'}
          uri={null}
          onChoisir={modifierPhoto}
          desactive={envoiPhoto}
          testID="photo-profil"
        />
      </View>
      <Bouton libelle="Se déconnecter" variante="secondaire" onPress={deconnecter} testID="bouton-deconnexion" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenu: {
    padding: espacements.l,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  entete: {
    alignItems: 'center',
    marginBottom: espacements.l,
  },
  nom: {
    marginTop: espacements.m,
    fontSize: 22,
    fontWeight: '800',
    color: couleurs.texte,
  },
  email: {
    marginTop: espacements.xs,
    color: couleurs.texteSecondaire,
  },
  statistiques: {
    flexDirection: 'row',
    backgroundColor: couleurs.surface,
    borderRadius: rayons.m,
    paddingVertical: espacements.m,
    marginBottom: espacements.m,
  },
  statistique: {
    flex: 1,
    alignItems: 'center',
  },
  valeur: {
    fontSize: 22,
    fontWeight: '800',
    color: couleurs.primaire,
  },
  libelle: {
    fontSize: 12,
    color: couleurs.texteSecondaire,
  },
  carte: {
    backgroundColor: couleurs.surface,
    borderRadius: rayons.m,
    padding: espacements.m,
    paddingBottom: 0,
    marginBottom: espacements.l,
  },
});
