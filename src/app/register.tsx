import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';

import { Bouton } from '@/components/button';
import { ChampTexte } from '@/components/text-field';
import { couleurs, espacements } from '@/constants/theme';
import { useAuthentification } from '@/context/auth-context';
import { traduireErreur } from '@/utils/errors';
import {
  estFormulaireValide,
  validerInscription,
  type ChampsInscription,
  type ErreursFormulaire,
} from '@/utils/validation';

export default function EcranInscription() {
  const { sInscrire } = useAuthentification();
  const [nom, definirNom] = useState('');
  const [email, definirEmail] = useState('');
  const [motDePasse, definirMotDePasse] = useState('');
  const [confirmation, definirConfirmation] = useState('');
  const [erreurs, definirErreurs] = useState<ErreursFormulaire<ChampsInscription>>({});
  const [erreurServeur, definirErreurServeur] = useState<string | null>(null);
  const [envoi, definirEnvoi] = useState(false);

  const soumettre = async () => {
    const nouvellesErreurs = validerInscription(nom, email, motDePasse, confirmation);
    definirErreurs(nouvellesErreurs);
    definirErreurServeur(null);
    if (!estFormulaireValide(nouvellesErreurs)) {
      return;
    }
    definirEnvoi(true);
    try {
      await sInscrire(nom, email, motDePasse);
    } catch (erreur) {
      definirErreurServeur(traduireErreur(erreur));
      definirEnvoi(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.ecran} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.contenu} keyboardShouldPersistTaps="handled">
        <Text style={styles.titre}>Créez votre compte</Text>
        <Text style={styles.sousTitre}>Quelques secondes suffisent pour commencer à enregistrer vos adresses.</Text>
        <ChampTexte
          libelle="Nom"
          placeholder="Votre nom ou pseudo"
          autoComplete="name"
          value={nom}
          onChangeText={definirNom}
          maxLength={50}
          erreur={erreurs.nom}
          testID="inscription-nom"
        />
        <ChampTexte
          libelle="Email"
          placeholder="vous@exemple.fr"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          value={email}
          onChangeText={definirEmail}
          erreur={erreurs.email}
          testID="inscription-email"
        />
        <ChampTexte
          libelle="Mot de passe"
          placeholder="6 caractères minimum"
          secureTextEntry
          autoComplete="new-password"
          value={motDePasse}
          onChangeText={definirMotDePasse}
          erreur={erreurs.motDePasse}
          testID="inscription-mot-de-passe"
        />
        <ChampTexte
          libelle="Confirmation du mot de passe"
          placeholder="Répétez le mot de passe"
          secureTextEntry
          autoComplete="new-password"
          value={confirmation}
          onChangeText={definirConfirmation}
          onSubmitEditing={soumettre}
          erreur={erreurs.confirmation}
          testID="inscription-confirmation"
        />
        {erreurServeur ? (
          <Text style={styles.erreur} testID="erreur-inscription">
            {erreurServeur}
          </Text>
        ) : null}
        <Bouton libelle="Créer mon compte" onPress={soumettre} chargement={envoi} testID="bouton-inscription" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  ecran: {
    flex: 1,
    backgroundColor: couleurs.fond,
  },
  contenu: {
    padding: espacements.l,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  titre: {
    fontSize: 24,
    fontWeight: '800',
    color: couleurs.texte,
  },
  sousTitre: {
    fontSize: 15,
    color: couleurs.texteSecondaire,
    marginTop: espacements.xs,
    marginBottom: espacements.l,
  },
  erreur: {
    color: couleurs.erreur,
    textAlign: 'center',
    marginBottom: espacements.m,
  },
});
