import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router/js-tabs';

import { couleurs } from '@/constants/theme';

export default function MiseEnPageOnglets() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: couleurs.primaire,
        tabBarInactiveTintColor: couleurs.texteSecondaire,
        headerTintColor: couleurs.texte,
        sceneStyle: { backgroundColor: couleurs.fond },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Carte',
          tabBarButtonTestID: 'onglet-carte',
          tabBarIcon: ({ color, size }) => <Ionicons name="map" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="my-addresses"
        options={{
          title: 'Mes adresses',
          tabBarButtonTestID: 'onglet-mes-adresses',
          tabBarIcon: ({ color, size }) => <Ionicons name="bookmark" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explorer',
          tabBarButtonTestID: 'onglet-explorer',
          tabBarIcon: ({ color, size }) => <Ionicons name="compass" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarButtonTestID: 'onglet-profil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-circle" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
