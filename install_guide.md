# Guide d'Installation et de Déploiement - Application SIDSIC

Ce document explique comment déployer l'application complète (Back-end et Front-end) à partir d'un fichier `.jar` exécutable, qui intègre déjà la version compilée (`dist`) de l'application Front-end SIDSIC.

## 1. Prérequis

Assurez-vous que le serveur ou la machine cible dispose des éléments suivants :

- **Java Runtime Environment (JRE) ou Java Development Kit (JDK)** version 17 (ou la version correspondant à votre backend Spring Boot).
- **Une base de données** (par exemple MySQL ou PostgreSQL), configurée et en cours d'exécution, correspondant aux attentes de l'application (si applicable).
- **Accès administrateur** sur le serveur ou la machine hôte pour ouvrir les ports nécessaires (généralement le port `8080`).

Pour vérifier la présence de Java, utilisez la commande suivante dans un terminal :
```bash
java -version
```
*Le résultat doit afficher une version égale ou supérieure à 17.*

## 2. Fichiers nécessaires

Pour l'installation, vous devez disposer des fichiers suivants dans le même répertoire cible sur votre serveur :
- `application-sidsic.jar` (le nom exact de votre archive `.jar`).
- `application.properties` ou `application.yml` (optionnel, uniquement si vous avez besoin de surcharger la configuration système comme la base de données, le port ou les clés secrètes).

*Note : La version du front-end (`dist`) est déjà embarquée à l'intérieur du `.jar` (typiquement dans `src/main/resources/static` ou `public`).*

## 3. Configuration de l'environnement (Optionnel)

Si vous utilisez un fichier `application.properties` externe, placez-le dans le même dossier que le `.jar`. L'application le lira automatiquement pour remplacer ses paramètres par défaut. 
Vous devrez généralement y renseigner :
- L'URL de votre base de données (`spring.datasource.url`).
- Les identifiants de la base de données (`spring.datasource.username` et `password`).
- Le port du serveur serveur (`server.port=8080`).

## 4. Lancement de l'application

Ouvrez un terminal (ou invite de commande), naviguez jusqu'au répertoire contenant votre `.jar`, et exécutez la commande suivante :

```bash
java -jar nom-de-votre-fichier.jar
```
*(Remplacez `nom-de-votre-fichier.jar` par le nom exact de votre archive, par exemple `java -jar sidsic-app-1.0.jar`)*

**Exécution en arrière-plan (serveur Linux) :**
Pour que l'application continue de fonctionner après la fermeture du terminal, utilisez `nohup` :
```bash
nohup java -jar nom-de-votre-fichier.jar > logs.txt 2>&1 &
```

Lors du démarrage, l'application Spring Boot initialisera la base de données, déploiera les API REST et servira automatiquement les fichiers statiques du front-end.

## 5. Accès à l'application

Une fois le message "_Started Application in X seconds_" affiché dans les logs du terminal, le déploiement est terminé.

Vous pouvez accéder à l'application en ouvrant un navigateur web et en naviguant vers l'URL du serveur :
- **En local** : [http://localhost:8080](http://localhost:8080)
- **Sur un serveur distant** : `http://<ADRESSE_IP_DU_SERVEUR>:8080`

L'interface utilisateur Front-end SIDSIC (Tâches, Notes, Achats, etc.) s'affichera immédiatement, et les requêtes `/api` seront automatiquement gérées par le même serveur.

## 6. Arrêt de l'application

- Si lancée dans un terminal interactif, utilisez le raccourci `Ctrl + C` ou `Cmd + C`.
- Si lancée en arrière-plan (nohup), trouvez le process ID et arrêtez-le :
  ```bash
  ps -ef | grep java
  kill -9 <PID>
  ```
