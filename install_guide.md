# Guide d'Installation et de Deploiement - Application SIDSIC

Ce document explique comment deployer l'application complete a partir d'un fichier .jar executable. Ce fichier integre deja la version compilee (dist) de l'application Front-end SIDSIC.

## 1. Prerequis

Assurez-vous que le serveur ou la machine cible dispose des elements suivants :

* Java Runtime Environment (JRE) ou Java Development Kit (JDK) version 21 (correspondant a la version de compilation du backend Spring Boot).
* Acces administrateur sur le serveur ou la machine hote pour ouvrir les ports necessaires (le port par defaut est le 8080).

Pour verifier la presence de Java, utilisez la commande suivante dans un terminal :
```bash
java -version
```

## 2. Fichiers necessaires

Pour l'installation, vous devez disposer des fichiers suivants :
* application-sidsic.jar (le nom exact de votre archive .jar).
* application.properties ou application.yml (optionnel, si vous avez besoin de surcharger la configuration par defaut du systeme).

Note : La base de donnees H2 utilisee par l'application est embarquee, ce qui signifie qu'aucune installation de systeme de base de donnees tiers (comme PostgreSQL ou MySQL) n'est requise.

## 3. Configuration de l'environnement (Optionnel)

Si vous utilisez un fichier application.properties externe, placez-le dans le meme dossier que le .jar. L'application le lira automatiquement pour remplacer ses parametres par defaut. 
Vous pouvez modifier des parametres comme le port du serveur en ajoutant la ligne suivante :
server.port=8080

## 4. Lancement de l'application

Ouvrez un terminal (ou invite de commande), naviguez jusqu'au repertoire contenant votre .jar, et executez la commande suivante :

```bash
java -jar nom-de-votre-fichier.jar
```

Execution en arriere-plan (cas d'un serveur Linux) :
Pour que l'application continue de fonctionner apres la fermeture du terminal, utilisez nohup :
```bash
nohup java -jar nom-de-votre-fichier.jar > logs.txt 2>&1 &
```

Lors du demarrage, l'application Spring Boot initialisera la base de donnees H2 embarquee, deploiera les API REST et servira automatiquement les fichiers statiques du front-end.

## 5. Acces a l'application

Une fois les logs du terminal indiquant la fin du demarrage de l'application, le deploiement est termine.

Vous pouvez acceder a l'application en ouvrant un navigateur web et en naviguant vers l'URL correspondante :
* En local : http://localhost:8080
* Sur un serveur distant : http://<ADRESSE_IP_DU_SERVEUR>:8080

L'interface utilisateur SIDSIC s'affichera, et les requetes /api seront automatiquement gerees par le meme serveur.

## 6. Arret de l'application

* Si l'application a ete lancee dans un terminal interactif, utilisez la combinaison de touches Ctrl + C.
* Si l'application a ete lancee en arriere-plan, trouvez l'identifiant du processus (PID) et arretez-le de cette maniere :
  ```bash
  ps -ef | grep java
  kill -9 <PID>
  ```
