# SIDSIC Dashboard

Application web complete de gestion de groupes et de collaboration en temps reel, composee d'un backend en Spring Boot et d'un frontend en React. 
Ce tableau de bord modulable permet d'administrer des equipes, de deleguer des elements aux membres d'un groupe, et de gerer divers elements collaboratifs sous forme de widgets interactifs.

## Fonctionnalites Principales

* Authentification et Gestion des Roles : Acces securise via structure JWT avec une hierarchie des droits (Administrateur, Membre, Invite).
* Gestion des Groupes : Creation, modification et administration des groupes de travail et de leurs membres.
* Tableau de Bord Modulable : Interface configurable et sauvegardee par utilisateur, permettant de redimensionner et d'agencer librement ses widgets sur une grille.
* Communication Temps Reel : Integration de connexions WebSockets persistantes pour actualiser les donnees de maniere instantanee chez tous les utilisateurs.

## Le Systeme de Widgets

Le coeur de l'application s'articule autour de differents widgets que chaque membre peut placer sur son tableau de bord :

* Notes : Un module permettant de saisir du texte, de prendre des notes rapides (titre et description) de facon collaborative, ideal pour des comptes-rendus ou des penses-betes d'equipe.
* Taches : Un gestionnaire de taches exhaustif. Une tache possede un nom, une description, une date de debut, et une date limite. Les membres du groupe peuvent etre assignes a ces taches. L'etat de chaque tache est modifiable (A faire, En cours, Termine, etc.), permettant un suivi precis de l'avancement global du groupe.
* Achats : Un outil de suivi des achats materiels necessaires ou effectues par l'equipe. L'utilisateur peut renseigner le nom et la marque du materiel, la reference, la personne impliquee, la quantite et surveiller l'etat d'avancement de cet achat.
* Prets : Un espace pour declarer, accorder et suivre le pret d'un materiel donne. Ce widget indique precisement la nature du materiel, qui l'emprunte, en quelle quantite, sur la periode allouee (date de debut et date de fin), ainsi que l'etat actuel du pret.
* Mouvements : Un module permettant le suivi des flux physiques ou logistiques (personnels, vehicules, missions). Il trace le nom et prenom de la personne, l'heure d'arrivee et de depart, et actualise le statut associe au mouvement en temps reel.
* Images : Un module esthetique et utilitaire capable d'afficher des images au sein du tableau de bord afin de l'illustrer (par exemple, un plan d'action, une map, ou un logo particulier).

## Architecture et Structure des Dossiers

Le projet est separe en deux repertoires vitaux, separant rigoureusement la logique client et serveur.

### Backend (dossier "dashboard-sidsic-backend")

Le backend expose l'API REST developpee en Java.

* Framework : Spring Boot 3.4.3
* Langage : Java 21
* Base de Donnees : H2 Database (base de donnees SQL embarquee) configuree avec Spring Data JPA
* Securite : Spring Security pour gerer l'authentification et les JSON Web Tokens (JJWT)
* Temps Reel : Spring WebSocket

Structure principale des sous-dossiers :
* src/main/java/fr/prefecture/sidsic/dashboard_sidsic/controller/ : Contient les endpoints de l'API REST (Auth, Achat, Groupe, Tache, Pret, Mouvement, Note). La communication vers le frontend passe par ces controleurs.
* src/main/java/fr/prefecture/sidsic/dashboard_sidsic/dto/ : Objets de transferts de donnees (DTO) utilises pour structurer et filtrer les informations qui transitent entre l'API et la base de donnees.
* src/main/java/fr/prefecture/sidsic/dashboard_sidsic/entity/ : Models JPA representant directement les tables dans la base de donnees H2 (Membre, Groupe, Tache, etc.).
* src/main/java/fr/prefecture/sidsic/dashboard_sidsic/config/ : Les configurations techniques du serveur telles que les autorisations de requetes WebSecurity, l'architecture WebSocket HTTP, les regles CORS.
* db/ : Repertoire abritant les fichiers de la base de donnees embarquee configuree par defaut.

### Frontend (dossier "sidsic-frontend")

Le frontend represente l'interface utilisateur interactive, developpee sous forme de Single Page Application (SPA).

* Framework : React 19
* Langage : TypeScript
* Outil de Build : Vite
* Routage : React Router DOM v7
* Style : Tailwind CSS v4
* Visualisation / Grille : React Grid Layout
* WebSockets : StompJS / SockJS Client

Structure principale des sous-dossiers :
* src/components/ : Ravitaille le projet en composants d'interface independants (Boutons, Champs editables, Barres de navigation, Modales).
* src/components/Widgets/ : Le coeur interactif du Dashboard contenant les affichages complets ou se font les requetes de Note, Achat, Tache, Mouvement, et Pret.
* src/pages/ : Contient les grands ecrans complets et navigables decrits dans les routes (DashboardPage, Administration, LoginPage, Tutorial).
* src/context/ : Fichiers permettant la persistance conditionnelle et globale de l'etat du compte et du token JWT.
* src/services/ : Fichiers gerant les liaisons au Backend via HTTP/WebSocket, definissant explicitement toutes les requetes POST, GET, PUT ou DELETE et leurs formats respectifs.
* src/types/ : Recueil d'interfaces TypeScript garantissant la validation statique des models manipules.
