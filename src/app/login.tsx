import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Bouton } from '@/components/button';
import { ChampTexte } from '@/components/text-field';
import { couleurs, espacements } from '@/constants/theme';
import { useAuthentification } from '@/context/auth-context';
import { traduireErreur } from '@/utils/errors';
import { estFormulaireValide, validerConnexion, type ChampsConnexion, type ErreursFormulaire } from '@/utils/validation';

export default function EcranConnexion() {
  const { seConnecter } = useAuthentification();
  const [email, definirEmail] = useState('');
  const [motDePasse, definirMotDePasse] = useState('');
  const [erreurs, definirErreurs] = useState<ErreursFormulaire<ChampsConnexion>>({});
  const [erreurServeur, definirErreurServeur] = useState<string | null>(null);
  const [envoi, definirEnvoi] = useState(false);

  const soumettre = async () => {
    const nouvellesErreurs = validerConnexion(email, motDePasse);
    definirErreurs(nouvellesErreurs);
    definirErreurServeur(null);
    if (!estFormulaireValide(nouvellesErreurs)) {
      return;
    }
    definirEnvoi(true);
    try {
      await seConnecter(email, motDePasse);
    } catch (erreur) {
      definirErreurServeur(traduireErreur(erreur));
      definirEnvoi(false);
    }
  };

  return (
    <SafeAreaView style={styles.ecran}>
      <KeyboardAvoidingView style={styles.ecran} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.contenu} keyboardShouldPersistTaps="handled">
          <View style={styles.entete}>
            <Text style={styles.logo}>📍</Text>
            <Text style={styles.titre}>Mes Bonnes Adresses</Text>
            <Text style={styles.sousTitre}>Sauvegardez et partagez vos lieux préférés</Text>
          </View>
          <ChampTexte
            libelle="Email"
            placeholder="vous@exemple.fr"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            value={email}
            onChangeText={definirEmail}
            erreur={erreurs.email}
            testID="connexion-email"
          />
          <ChampTexte
            libelle="Mot de passe"
            placeholder="Votre mot de passe"
            secureTextEntry
            autoComplete="password"
            value={motDePasse}
            onChangeText={definirMotDePasse}
            onSubmitEditing={soumettre}
            erreur={erreurs.motDePasse}
            testID="connexion-mot-de-passe"
          />
          {erreurServeur ? (
            <Text style={styles.erreur} testID="erreur-connexion">
              {erreurServeur}
            </Text>
          ) : null}
          <Bouton libelle="Se connecter" onPress={soumettre} chargement={envoi} testID="bouton-connexion" />
          <View style={styles.pied}>
            <Text style={styles.texteSecondaire}>Pas encore de compte ?</Text>
            <Link href="/register" style={styles.lien} testID="lien-inscription">
              Créer un compte
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ecran: {
    flex: 1,
    backgroundColor: couleurs.fond,
  },
  contenu: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: espacements.l,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  entete: {
    alignItems: 'center',
    marginBottom: espacements.xl,
  },
  logo: {
    fontSize: 56,
  },
  titre: {
    fontSize: 28,
    fontWeight: '800',
    color: couleurs.texte,
    marginTop: espacements.s,
  },
  sousTitre: {
    fontSize: 15,
    color: couleurs.texteSecondaire,
    marginTop: espacements.xs,
    textAlign: 'center',
  },
  erreur: {
    color: couleurs.erreur,
    textAlign: 'center',
    marginBottom: espacements.m,
  },
  pied: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: espacements.xs,
    marginTop: espacements.l,
  },
  texteSecondaire: {
    color: couleurs.texteSecondaire,
  },
  lien: {
    color: couleurs.secondaire,
    fontWeight: '700',
  },
});
