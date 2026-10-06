import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { EtatVide } from '@/components/empty-state';
import { estFirebaseConfigure } from '@/config/firebase';
import { couleurs } from '@/constants/theme';
import { FournisseurAuthentification, useAuthentification } from '@/context/auth-context';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: couleurs.primaire,
    background: couleurs.fond,
    card: couleurs.surface,
    text: couleurs.texte,
    border: couleurs.bordure,
  },
};

function Navigation() {
  const { utilisateur, chargement } = useAuthentification();

  if (chargement) {
    return <EtatVide titre="Mes Bonnes Adresses" message="Chargement..." chargement testID="ecran-chargement" />;
  }

  const estConnecte = Boolean(utilisateur);

  return (
    <Stack screenOptions={{ headerTintColor: couleurs.primaire, contentStyle: { backgroundColor: couleurs.fond } }}>
      <Stack.Protected guard={estConnecte}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="address/new" options={{ title: 'Nouvelle adresse' }} />
        <Stack.Screen name="address/[id]" options={{ title: 'Détail' }} />
      </Stack.Protected>
      <Stack.Protected guard={!estConnecte}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ title: 'Inscription' }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function MiseEnPageRacine() {
  return (
    <SafeAreaProvider>
      <ThemeProvider value={theme}>
        <StatusBar style="dark" />
        {estFirebaseConfigure ? (
          <FournisseurAuthentification>
            <Navigation />
          </FournisseurAuthentification>
        ) : (
          <EtatVide
            icone="⚙️"
            titre="Firebase n'est pas configuré"
            message="Copiez .env.example en .env, renseignez vos clés Firebase puis relancez l'application (voir README)."
            testID="ecran-configuration"
          />
        )}
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
