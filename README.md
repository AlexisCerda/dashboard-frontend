# Dashboard SIDSIC - Front-End

Bienvenue sur le dépôt Front-End du projet **Dashboard SIDSIC**.
Cette application web est un bureau virtuel interactif et collaboratif conçu pour les équipes de la Préfecture. Elle permet aux utilisateurs de créer, gérer et partager des configurations de widgets en temps réel au sein de groupes de travail.

**Back-End associé (Spring Boot) :** https://github.com/AlexisCerda/dashboard-backend

---

## Fonctionnalités Principales

### Gestion des Bureaux (Drag & Drop)

- **Système de grille dynamique :** Déplacement (Drag & Drop) et redimensionnement des widgets grâce à `react-grid-layout`.
- **Multi-Configurations :** Possibilité de créer, nommer et sauvegarder plusieurs dispositions de bureau pour un même groupe.
- **Sauvegarde automatique :** La position et la taille des widgets sont sauvegardées en base de données automatiquement (avec un système de _debounce_ de 500ms pour optimiser les appels API).

### Widgets Intégrés

- **Widgets Uniques (Singletons) :** Tâches, Notes, Achats, Prêts, Mouvements. Un seul exemplaire autorisé par bureau.
- **Widget Galerie d'Images (Multiples) :** \* Possibilité d'ajouter plusieurs widgets "Images" indépendants sur le même bureau.
- **Upload de fichiers :** Téléversement de fichiers physiques locaux (limités à 5 Mo) avec gestion du format `multipart/form-data`.
- **Affichage ciblé :** Chaque widget peut verrouiller l'affichage d'une image spécifique en plein écran (sauvegarde locale via `localStorage`).

### Collaboration en Temps Réel

- **WebSockets :** Synchronisation instantanée des actions entre les membres d'un même groupe (ajout de widgets, modifications de données) grâce à `SockJS` et `Stomp.js`.
- Aucun rafraîchissement manuel nécessaire : les mises à jour sont poussées directement par le serveur.

### Sécurité et Rôles

- **Authentification JWT :** Les requêtes API sont protégées par un token (via `AuthContext`).
- **Gestion des permissions :** Différenciation des affichages et des droits d'action selon le rôle (Administrateur du groupe vs Invité).

## Technologies & Stack Technique

- **Framework Core :** React 18
- **Langage :** TypeScript (Typage strict des entités et des props)
- **Stylisation :** Tailwind CSS
- **Grille & Layout :** `react-grid-layout` / `react-resizable`
- **Temps réel :** `@stomp/stompjs`, `sockjs-client`
- **Icônes :** Lucide React
- **Routage :** React Router DOM

## Installation et Lancement (Local)

### 1. Prérequis

- [Node.js](https://nodejs.org/) (version 16 ou supérieure recommandée).
- Le **Back-End Spring Boot** doit être opérationnel et tourner sur `http://localhost:8080`.

### 2. Cloner le projet

git clone [https://github.com/AlexisCerda/dashboard-frontend.git](https://github.com/AlexisCerda/dashboard-frontend.git)
cd dashboard-frontend

### 3. Installer les dépendances

npm install

### 4. Variables d'environnement

Assurez-vous que l'URL de votre API correspond à votre serveur. Par défaut, les services (ex: `WidgetService.ts`) pointent vers `http://localhost:8080`.

### 5. Lancer l'application

Si vous utilisez **Create React App** :

npm start

Si vous utilisez **Vite** :

npm run dev

L'application sera accessible sur `http://localhost:3000` (ou `http://localhost:5173` pour Vite).

## Architecture et Choix Techniques

- **Context API (`AuthContext`) :** Utilisé pour maintenir l'état de connexion de l'utilisateur et son groupe actif à travers toute l'application.
- **Services Séparés :** Les appels API sont isolés dans le dossier `services/` (ex: `membreService.ts`, `WidgetService.ts`) pour séparer la logique métier de l'interface graphique.
- **Gestion des envois de fichiers :** Pour le téléversement d'images, l'utilisation stricte de l'objet natif `FormData` et de l'objet `Headers` (sans forcer le `Content-Type`) permet de déléguer la construction du _boundary multipart_ au navigateur, évitant ainsi les rejets 415 (Unsupported Media Type) du backend Java.

## Auteur

Développé par **Alexis Cerda De Almeida Vilaca** dans le cadre des projets de la Préfecture (SIDSIC).
