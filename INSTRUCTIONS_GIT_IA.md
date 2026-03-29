# Guide de Déploiement Git pour IA (Cas de Secours)

Ce document est destiné aux IA et développeurs rencontrant des problèmes de synchronisation Git (dossier `.git` manquant, historiques non liés, ou erreurs de push).

## Contexte
Si vous travaillez sur un projet téléchargé (zip) ou si le dossier `.git` est corrompu/absent, mais que **les fichiers locaux sont la version la plus à jour et la source de vérité**, suivez cette procédure pour forcer la mise à jour du dépôt distant.

⚠️ **Attention** : Cette méthode utilise un `force push` (`-f`). Elle écrasera l'historique du dépôt distant. À n'utiliser que si vous êtes sûr que votre version locale doit remplacer la version distante.

## Si la commande `git` est introuvable
Sur certaines machines, Git est installé via GitHub Desktop et n'est pas dans le PATH. Dans ce cas, utilisez directement l'exécutable Git embarqué :

```powershell
$git = "$env:LOCALAPPDATA\GitHubDesktop\app-3.5.4\resources\app\git\cmd\git.exe"
& $git --version
```

Si le dossier `app-3.5.4` est différent, listez les versions disponibles :
```powershell
Get-ChildItem "$env:LOCALAPPDATA\GitHubDesktop" -Directory
```

Ensuite, remplacez `git` par `& $git` dans toutes les commandes ci-dessous.

## Procédure "Re-init & Force Push"

Voici la séquence de commandes à exécuter dans le terminal (PowerShell ou Bash) à la racine du projet :

1.  **Réinitialiser le dépôt local :**
    Cela recrée un dossier `.git` propre.
    ```bash
    git init
    ```

2.  **Créer/Basculer sur la branche principale :**
    Assurez-vous d'être sur `main` (ou `master`).
    ```bash
    git checkout -b main
    ```

3.  **Lier le dépôt distant :**
    Remplacez l'URL par celle de votre dépôt GitHub.
    ```bash
    git remote add origin https://github.com/matteohrq3842-stack/GigaPricevmax
    ```
    *(Si le remote existe déjà, utilisez `git remote set-url origin ...` ou supprimez-le avec `git remote remove origin` avant d'ajouter).*

4.  **Ajouter tous les fichiers :**
    ```bash
    git add .
    ```

5.  **Créer le commit de sauvegarde :**
    ```bash
    git commit -m "chore: re-init and sync project state"
    ```

6.  **Tenter un Pull (Optionnel mais recommandé pour vérifier) :**
    Si vous voulez essayer de fusionner (souvent échoue avec "unrelated histories").
    ```bash
    git pull origin main --allow-unrelated-histories
    ```
    *Si cela crée trop de conflits et que vous voulez imposer votre version locale, passez à l'étape 7.*

7.  **Forcer le Push (La "Technique") :**
    C'est l'étape clé pour valider que votre version locale devient la version distante.
    ```bash
    git push -f origin main
    ```

## Résumé pour l'IA
Si tu ne parviens pas à push classiquement :
1. `git init`
2. `git checkout -b main`
3. `git remote add origin <URL>`
4. `git add .`
5. `git commit -m "msg"`
6. `git push -f origin main`
