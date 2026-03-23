# SIDSIC Frontend

Application web de gestion de groupes et de collaboration en temps réel, développée avec **React**, **TypeScript**, et **Vite**.

Ce tableau de bord (Dashboard) modulable permet d'administrer des équipes et de gérer divers éléments collaboratifs sous forme de "Widgets".

## 🚀 Fonctionnalités Principales

- **Authentification et Gestion des Rôles** : Accès sécurisé avec gestion des rôles (Administrateur, Membre, Invité).
- **Gestion des Groupes** : Création, modification et administration des groupes et de leurs membres.
- **Tableau de Bord Modulable** : Interface personnalisable grâce à `react-grid-layout`, permettant de disposer les widgets librement.
- **Widgets Intégrés** :
  - 📝 **Notes** : Prise de notes collaborative rapide.
  - ✅ **Tâches** : Suivi de tâches avec assignation de membres, dates de début/limite, et changement d'états.
  - 📦 **Achats** : Suivi des achats matériels (nom, référence, quantité, état).
  - 🔄 **Prêts** : Suivi du matériel prêté aux membres du groupe (matériel, dates d'emprunt, état).
  - 🚪 **Mouvements** : Suivi des entrées et sorties (arrivées/départs des personnes, états).
  - 🖼️ **Images** : Affichage d'images sur le tableau de bord.
- **Communication Temps Réel** : Intégration de WebSockets via `@stomp/stompjs` et `sockjs-client` pour des mises à jour en direct.

## 🛠️ Stack Technique

- **Framework** : React 19
- **Langage** : TypeScript
- **Outil de Build** : Vite
- **Routage** : React Router DOM v7
- **Style** : Tailwind CSS v4
- **Composants UI / Grille** : React Grid Layout
- **Icônes** : Lucide React
- **WebSockets** : STOMP (StompJS / SockJS)

## 📂 Architecture du Projet

Le code source se trouve principalement dans le dossier `src/` :

- `assets/` : Ressources statiques (images, logos).
- `components/` : Composants réutilisables.
  - `Widgets/` : Ensemble des widgets affichés sur le tableau de bord (Tâches, Achats, Notes, etc.).
- `context/` : Contextes React, tels que `AuthContext` pour la gestion de session.
- `pages/` : Les pages principales (Dashboard, Connexion, Inscription, Tutoriel, Administration, etc.).
- `services/` : Fonctions d'appels API (ex: `WidgetService.ts`, `authService.ts`, `membreService.ts`).
- `types/` : Définition des types et interfaces globaux TypeScript.

## 💻 Développement Local

### Prérequis

- Node.js (version 18 ou supérieure recommandée)
- npm (ou pnpm / yarn)

### Installation et Exécution

1. Installer les dépendances :
   ```bash
   npm install
   ```

2. Démarrer le serveur de développement :
   ```bash
   npm run dev
   ```

3. Construire le projet pour la production :
   ```bash
   npm run build
   ```

## 📜 Scripts Disponibles

- `npm run dev` : Lance le serveur en mode développement.
- `npm run build` : Compile le TypeScript et génère la version de production dans le dossier `dist/`.
- `npm run lint` : Vérifie le code via ESLint.
- `npm run preview` : Lance un serveur local pour tester la version `dist/`.
