# SIDSIC Dashboard

Application web complete de gestion de groupes et de collaboration en temps reel, composee d'un backend en Spring Boot et d'un frontend en React. 
Ce tableau de bord modulable permet d'administrer des equipes et de gerer divers elements collaboratifs sous forme de widgets.

## Fonctionnalites Principales

* Authentification et Gestion des Roles : Acces securise via JWT avec gestion des roles (Administrateur, Membre, Invite).
* Gestion des Groupes : Creation, modification et administration des groupes et de leurs membres.
* Tableau de Bord Modulable : Interface personnalisable permettant de disposer les widgets librement.
* Widgets Integres :
  * Notes : Prise de notes collaborative rapide.
  * Taches : Suivi de taches avec assignation de membres, dates de debut/limite, et changement d'etats.
  * Achats : Suivi des achats materiels (nom, reference, quantite, etat).
  * Prets : Suivi du materiel prete aux membres du groupe (materiel, dates d'emprunt, etat).
  * Mouvements : Suivi des entrees et sorties (arrivees/departs des personnes, etats).
  * Images : Affichage d'images sur le tableau de bord.
* Communication Temps Reel : Integration de WebSockets pour des mises a jour en direct.

## Architecture du Projet

Le projet est divise en deux parties principales :

### Backend (dashboard-sidsic-backend)

Le backend est une API REST développée en Java fournissant les donnees et la securite a l'application.

* Framework : Spring Boot 3.4.3
* Langage : Java 21
* Base de Donnees : H2 Database (embarquee) avec Spring Data JPA
* Securite : Spring Security avec JSON Web Tokens (JJWT)
* Temps Reel : Spring WebSocket

### Frontend (sidsic-frontend)

Le frontend est l'interface utilisateur interactive, developpee sous forme de Single Page Application (SPA).

* Framework : React 19
* Langage : TypeScript
* Outil de Build : Vite
* Routage : React Router DOM v7
* Style : Tailwind CSS v4
* Composants UI / Grille : React Grid Layout
* Icones : Lucide React
* WebSockets : StompJS / SockJS Client
