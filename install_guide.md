# Guide d'Installation de l'Application SIDSIC avec PM2

Ce document explique comment deploier et demarrer l'application complete a partir d'un fichier .jar executable contenant la version du frontend embarquee ("dist").
Ce processus utilise l'outil PM2 pour que l'execution de l'application Java soit daemonisee (executee et monitoree en arriere-plan pour survivre aux fermetures de terminaux ou redemarrages).

## 1. Prerequis du Systeme

Afin de deploier et gerer correctement l'application via PM2, assurez-vous d'avoir installe les elements suivants sur le serveur cible :

* Java Runtime Environment (JRE) version 21 (correspondant a la compilation du backend).
* Node.js (version 18 ou superieure) associe au gestionnaire NPM.
* PM2 (Process Manager for Node.js & other applications). L'installation se fait de maniere globale :

Dans le terminal ou l'invite de commande (en tant qu'administrateur), executez :
```bash
npm install -g pm2
```

Pour verifier que PM2 a ete installe avec succes, executez :
```bash
pm2 -v
```

## 2. Preparation des Fichiers

Creez un dossier specifique sur votre serveur pour l'application. Vous devez y inserer :
* Le fichier application.jar de votre projet SIDSIC.
* Le fichier application.properties ou application.yml (optionnel, uniquement pour parametrer un port different ou the base de donnees).

Note conernant la portabilite : Le .jar incorpore et deploie la version build du front-end React, et utilise une base de donnees H2 locale preconfiguree. Il constitue le seul veritable element requis.

## 3. Demarrage de l'Application Java via PM2

PM2 peut orchestrer tout type de script en plus du JavaScript, y compris les binaires Java. 
Ouvrez le terminal dans le repertoire ou se trouve votre fichier .jar, et lancez la commande suivante :

```bash
pm2 start java --name "sidsic" -- -jar nom-du-fichier-build.jar
```
Remplacez "nom-du-fichier-build.jar" par le titre de votre .jar SIDSIC.

Le terminal affichera un tableau recapitulatif confirmant que le processus appele "sidsic" a bien ete demarre, qu'il est "online", assigne a un identifiant, et suivi continu en tache de fond.

Lors du demarrage, l'application initiale le systeme de base de donnees et lance les APIs REST, en ouvrant l'application vers l'exterieur sur le port 8080 (ou le port enonce dans les proprietes additionnelles).

## 4. Sauvegarde au Redemarrage (Optionnel mais recommande)

Afin d'assurer que PM2 relance de maniere autonome l'application SIDSIC en cas d'arret complet de la machine host/serveur, vous devez enregistrer la liste actuelle et ajouter un script Startup lie au systeme d'exploitation associe.

Dans le terminal, tapez :
```bash
pm2 save
```
Ensuite, configurez le lanceur de machine au boot selon la plateforme d'accueuil de maniere automatique en tapant :
```bash
pm2 startup
```
(Remarque : Cette derniere commande affichera surement une seconde instruction a copier-coller dans votre terminal, suivez ce qui est indique a l'ecran).

## 5. Acces a l'Application

Le processus etant relaye via PM2 et initialise, ouvrez le navigateur de votre choix et dirigez-vous vers l'URL d'audience de la machine hebergeant le fichier :

* En developpement/Machine locale : http://localhost:8080
* En environnement cible : http://<ADRESSE_IP>:8080

L'interface de l'application sera disponible immediatement.

## 6. Commandes Utiles (Maintenance PM2)

En cours de developpement ou lors de l'exploitation de l'application, voici quelques commandes de necessite basique :

1. Visualiser les logs / les erreurs :
```bash
pm2 logs sidsic
```
2. Redemarrer l'application suite a un changement serveur :
```bash
pm2 restart sidsic
```
3. Arreter temporairement le processus :
```bash
pm2 stop sidsic
```
4. Supprimer l'application totalement du monitoring PM2 :
```bash
pm2 delete sidsic
```
