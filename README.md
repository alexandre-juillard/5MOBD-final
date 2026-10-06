# Mes Bonnes Adresses

## Description

**Mes Bonnes Adresses** est une application mobile (Android, iOS) et web, développée en React Native avec Expo. Elle permet de sauvegarder, gérer et partager ses lieux favoris.

Fonctionnalités principales :

- **Compte utilisateur** : inscription, connexion, déconnexion, session conservée au redémarrage, photo de profil (galerie ou appareil photo).
- **Carte interactive** : la carte se centre automatiquement sur la position de l'utilisateur et affiche :
  - mes adresses (marqueurs orange) ;
  - les adresses publiques des autres utilisateurs (marqueurs bleus).

  Sur mobile, la carte utilise MapView (`react-native-maps` : Google Maps sur Android, Plans sur iOS). Sur le web, elle utilise Leaflet et OpenStreetMap.
- **Création d'adresse** : nom, description, photo, option **privée / publique**. L'emplacement se définit au choix :
  - par recherche d'une adresse texte (géocodage OpenStreetMap Nominatim) ;
  - en appuyant sur la carte ;
  - avec la position actuelle.
- **Suppression d'adresse** par son propriétaire, après confirmation. Les avis associés sont supprimés avec elle.
- **Consultation** :
  - « Mes adresses » : mes adresses publiques et privées, avec un filtre ;
  - « Explorer » : les adresses publiques des autres utilisateurs, avec une recherche.
- **Dimension sociale** : une note de 1 à 5 étoiles et un commentaire texte et/ou photo sur les adresses publiques des autres. Note moyenne affichée ; modification et suppression de son propre avis.
- **Sécurité** : règles Firestore et Storage. Une adresse privée n'est lisible que par son propriétaire, chacun ne modifie que ses propres données, et les données sont validées côté serveur (voir [firestore.rules](./firestore.rules) et [storage.rules](./storage.rules)).

Stack technique : Expo SDK 57, expo-router, React 19, TypeScript, Firebase (Authentication, Firestore, Storage), Jest, Testing Library, ESLint, Storybook, Maestro.

## Prérequis

| Outil | Version / remarque |
| --- | --- |
| [Node.js](https://nodejs.org/) | LTS **20.18.0 ou supérieure** (`node -v`) |
| npm | fourni avec Node.js |
| Compte [Firebase](https://console.firebase.google.com/) | projet au **plan Blaze**, obligatoire pour Firebase Storage (gratuit sous les quotas, mais carte bancaire requise) |
| [Expo Go](https://expo.dev/go) | sur le téléphone Android / iOS, pour lancer l'application mobile |
| Navigateur récent | pour la version web et Storybook |
| [Maestro](https://docs.maestro.dev/) ou Maestro Studio | pour les tests E2E (nécessite Java 17+) |
| [Android Platform Tools (adb)](https://developer.android.com/tools/releases/platform-tools) | pour les tests E2E sur un appareil Android branché en USB |

## Installation

```bash
git clone https://github.com/alexandre-juillard/5MOBD-final.git
cd 5MOBD-final
npm install
```

Copiez ensuite le fichier d'exemple des variables d'environnement, puis renseignez les clés Firebase (voir le tutoriel ci-dessous) :

```bash
cp .env.example .env
```

> Le fichier `.env` n'est pas versionné. Sans clés valides, l'application affiche un écran « Firebase n'est pas configuré ».

## Tutoriel : configurer Firebase et obtenir les clés

### 1. Créer le projet

1. Ouvrez la [console Firebase](https://console.firebase.google.com/) et cliquez sur **Créer un projet**.
2. Donnez-lui un nom (par exemple `mes-bonnes-adresses`). Google Analytics est facultatif.

### 2. Enregistrer une application Web et récupérer les clés

L'application utilise le SDK JavaScript de Firebase, qui fonctionne sur Android, iOS et le web. Il suffit donc d'enregistrer **une seule application de type Web**.

1. Sur la page d'accueil du projet, cliquez sur l'icône **Web** (`</>`).
2. Saisissez un surnom (par exemple `mes-bonnes-adresses-web`). Ne cochez pas Firebase Hosting. Cliquez sur **Enregistrer l'application**.
3. Firebase affiche un objet `firebaseConfig`. Copiez chaque valeur dans votre fichier `.env` :

| Clé `firebaseConfig` | Variable du fichier `.env` |
| --- | --- |
| `apiKey` | `EXPO_PUBLIC_FIREBASE_API_KEY` |
| `authDomain` | `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` |
| `projectId` | `EXPO_PUBLIC_FIREBASE_PROJECT_ID` |
| `storageBucket` | `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` |
| `messagingSenderId` | `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` |
| `appId` | `EXPO_PUBLIC_FIREBASE_APP_ID` |

Exemple de fichier `.env` (valeurs fictives) :

```dotenv
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=mes-bonnes-adresses.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=mes-bonnes-adresses
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=mes-bonnes-adresses.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

> Vous retrouvez ces valeurs à tout moment dans **Paramètres du projet** (roue dentée) > **Général** > **Vos applications**.
> Ces clés identifient le projet et ne sont pas des secrets : la sécurité repose sur les règles Firestore et Storage. Le fichier `.env` reste néanmoins hors du dépôt.

### 3. Activer l'authentification par email

1. Menu **Créer** > **Authentication** > **Commencer**.
2. Onglet **Mode de connexion** : activez **Adresse e-mail/Mot de passe**, puis enregistrez.

### 4. Créer la base Firestore

1. Menu **Créer** > **Firestore Database** > **Créer une base de données**.
2. Choisissez un emplacement proche (par exemple `eur3 (europe-west)`).
3. Démarrez en **mode production** : les règles du projet seront appliquées à l'étape 6.

### 5. Activer Firebase Storage (plan Blaze)

1. Cliquez sur **Mettre à niveau** en bas du menu, puis choisissez le plan **Blaze**. Il est conseillé de définir une alerte budgétaire, par exemple 1 €.
2. Menu **Créer** > **Storage** > **Commencer**, en **mode production**, dans la même région que Firestore.

### 6. Déployer les règles de sécurité

**Option A, console (simple)** :

- **Firestore Database** > onglet **Règles** : remplacez le contenu par celui de [firestore.rules](./firestore.rules), puis cliquez sur **Publier**.
- **Storage** > onglet **Règles** : remplacez le contenu par celui de [storage.rules](./storage.rules), puis cliquez sur **Publier**.

**Option B, ligne de commande** :

```bash
npx firebase-tools login
npx firebase-tools use --add
npm run firebase:regles
```

Avec `use --add`, sélectionnez votre projet ; l'alias proposé (`default`) convient.

Résumé des règles appliquées :

- `utilisateurs/{uid}` : lecture par tout utilisateur connecté ; création et modification (nom, photo) par le titulaire uniquement.
- `adresses/{id}` :
  - lecture si l'adresse est publique, ou si l'on en est le propriétaire ;
  - création, modification et suppression par le propriétaire uniquement, avec validation des champs.
- `adresses/{id}/avis/{uid}` :
  - un avis par utilisateur, avec une note entière de 1 à 5 et un commentaire ou une photo ;
  - uniquement sur une adresse publique, et jamais sur la sienne ;
  - suppression par l'auteur ou par le propriétaire de l'adresse.
- Storage : images de 5 Mo maximum, écriture uniquement dans `{dossier}/{uid}/`. Tout le reste est refusé par défaut.

### 7. Lancer l'application

```bash
npm start
```

Scannez le QR code avec Expo Go. Sur iOS, utilisez l'appareil photo. Après toute modification du fichier `.env`, relancez avec `npx expo start --clear`.

## Commandes d'usage

| Commande | Description |
| --- | --- |
| `npm start` | Démarre le serveur de développement Expo (QR code pour Expo Go) |
| `npm run android` | Démarre et ouvre l'application sur Android (appareil ou émulateur) |
| `npm run ios` | Démarre et ouvre l'application sur iOS (simulateur macOS ou appareil via Expo Go) |
| `npm run web` | Démarre la version web dans le navigateur |
| `npm run lint` | Analyse le code avec ESLint |
| `npm run typecheck` | Vérifie les types TypeScript |
| `npm test` | Lance les tests unitaires et fonctionnels (Jest + Testing Library) |
| `npm run test:watch` | Lance les tests en mode surveillance |
| `npm run test:coverage` | Lance les tests avec un rapport de couverture (`coverage/`) |
| `npm run storybook:dev` | Démarre Storybook sur <http://localhost:6006> |
| `npm run storybook:build` | Génère la version statique de Storybook (`storybook-static/`) |
| `npm run test:e2e` | Lance les tests E2E Maestro (voir ci-dessous) |
| `npm run firebase:regles` | Déploie les règles Firestore et Storage avec Firebase CLI |

## Tests

### Tests unitaires et fonctionnels

Ils se trouvent dans [src/\_\_tests\_\_](./src/__tests__) et n'appellent jamais Firebase, qui est simulé :

- `utils/` : validation des formulaires, formatage, filtres, traduction des erreurs ;
- `services/` : authentification, adresses, avis, stockage d'images, géocodage ;
- `components/` : composants d'interface ;
- `context/` : fournisseur d'authentification ;
- `screens/` : parcours fonctionnels des écrans (connexion, inscription, création, détail, avis, listes, profil) et protection des routes.

### Tests E2E avec Maestro

Les flux se trouvent dans [.maestro](./.maestro) et s'exécutent dans **Expo Go** (`host.exp.exponent`) :

| Flux | Scénario |
| --- | --- |
| `01-inscription.yaml` | Inscription, vérification du profil, déconnexion |
| `02-connexion.yaml` | Erreurs de connexion, puis connexion valide |
| `03-adresses.yaml` | Création d'une adresse privée et d'une publique, filtres, détail, suppressions |
| `04-avis.yaml` | Un utilisateur publie une adresse, un autre lui laisse une note et un commentaire |

Chaque flux crée des comptes et des adresses uniques (horodatés) dans votre projet Firebase.

Exécution avec un téléphone Android branché en USB :

1. Activez le **débogage USB** sur le téléphone et vérifiez qu'il apparaît avec `adb devices`.
2. Démarrez le projet : `npm start`.
3. Redirigez le port Metro vers le téléphone : `adb reverse tcp:8081 tcp:8081`.
4. Lancez les flux :
   - **CLI** : `npm run test:e2e`, ou un seul flux avec `maestro test .maestro/01-inscription.yaml` ;
   - **Maestro Studio** : ouvrez un flux du dossier `.maestro` et lancez-le.

Par défaut, les flux ouvrent `exp://127.0.0.1:8081`. Pour une connexion Wi-Fi, passez l'URL affichée par `npm start` :

```bash
maestro test -e EXPO_URL=exp://192.168.1.20:8081 .maestro
```

Dans Maestro Studio, définissez la variable `EXPO_URL` dans les paramètres d'environnement.

### Storybook

```bash
npm run storybook:dev
```

Storybook (React Native Web + Vite) présente chaque composant d'interface dans ses différents états : boutons, champs, notes, avatars, visibilité, sélecteur de photo, cartes d'adresse et d'avis, formulaire d'avis, états vides et carte web.

## Structure du projet

```text
src/
├── app/                   Routes expo-router
│   ├── _layout.tsx        Navigation racine et routes protégées
│   ├── login.tsx          Connexion
│   ├── register.tsx       Inscription
│   ├── (tabs)/            Carte, Mes adresses, Explorer, Profil
│   └── address/           Création (new) et détail avec avis ([id])
├── components/            Composants d'interface (+ stories Storybook)
│   └── map/               Carte native (react-native-maps) et web (Leaflet)
├── config/                Initialisation de Firebase
├── constants/             Thème (couleurs, espacements)
├── context/               Contexte d'authentification
├── hooks/                 Localisation, écoute des adresses
├── services/              Accès à Firebase et au géocodage
├── types/                 Modèles de données
├── utils/                 Validation, formatage, dialogues, sélection d'image
└── __tests__/             Tests Jest
.maestro/                  Flux E2E Maestro
.storybook/                Configuration Storybook
firestore.rules            Règles de sécurité Firestore
storage.rules              Règles de sécurité Storage
```

## Remarques

- **Google Maps sur Android** : aucune clé n'est nécessaire dans Expo Go. Pour un build de production (EAS Build), ajoutez une clé Google Maps SDK for Android dans `app.json` (`android.config.googleMaps.apiKey`).
- **Géocodage** : la recherche d'adresse utilise le service public [Nominatim](https://operations.osmfoundation.org/policies/nominatim/), limité à environ 1 requête par seconde.
- **Photos** : les images sont redimensionnées (1080 px) et compressées en JPEG avant l'envoi, pour limiter l'utilisation de Firebase Storage.
