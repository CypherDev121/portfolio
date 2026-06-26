# CypherDev Portfolio - version corrigée

## Ce qui a été corrigé

- Les vues ne passent plus par `counterapi.dev` : tout est maintenant dans Firebase Firestore.
- Le bug qui écrasait les vues Firebase avec l'ancien compteur a été supprimé.
- Les visiteurs `live` sont mis à jour avec une présence Firestore.
- Les compétences HTML / CSS / SCSS / JS / VUE / LUA / MYSQL / NUI sont maintenant des images `.png` dans `assets/skills/`.
- Le site reste responsive PC, tablette et mobile.

## Fichiers importants

- `index.html` : page publique.
- `admin/index.html` : vrai panel admin privé.
- `firebase-config.js` : ta configuration Firebase.
- `fetch-data.js` : vues, live, données du portfolio en temps réel.
- `admin.js` : connexion admin + modification du site.
- `assets/skills/*.png` : images des technologies.

## Étape 1 - Créer Firebase

1. Va sur Firebase Console.
2. Crée un projet.
3. Va dans **Build > Authentication > Sign-in method**.
4. Active **Email/Password**.
5. Va dans **Authentication > Users**.
6. Ajoute ton compte admin avec ton email et ton mot de passe.
7. Va dans **Build > Firestore Database**.
8. Crée une base Firestore en mode production.

## Étape 2 - Coller ta config Firebase

Dans Firebase :

1. Project settings / Paramètres du projet.
2. Section **Your apps / Vos applications**.
3. Ajoute une app Web `</>`.
4. Copie la config.
5. Remplace le contenu dans `firebase-config.js`.

Exemple :

```js
export const firebaseConfig = {
  apiKey: "TON_API_KEY",
  authDomain: "ton-projet.firebaseapp.com",
  projectId: "ton-projet",
  storageBucket: "ton-projet.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

export const ADMIN_EMAIL = "ton-email@gmail.com";
```

`ADMIN_EMAIL` doit être exactement le même email que ton utilisateur Firebase Authentication.

## Étape 3 - Mettre les règles Firestore

Va dans **Firestore Database > Rules** et colle ceci. Remplace `ton-email@gmail.com` par ton vrai email admin.

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAdmin() {
      return request.auth != null && request.auth.token.email == "ton-email@gmail.com";
    }

    match /portfolio/data {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /stats/views {
      allow read: if true;
      allow create, update: if true;
    }

    match /presence/{sessionId} {
      allow read: if true;
      allow create, update, delete: if true;
    }
  }
}
```

## Étape 4 - Mettre le site en ligne

Sur GitHub Pages, mets tous les fichiers à la racine du repo.

Ensuite :

- Ton site : `https://TON-NOM.github.io/TON-REPO/`
- Ton panel admin : `https://TON-NOM.github.io/TON-REPO/admin/`

## Pourquoi les vues ne marchaient pas avant

Le fichier `script.js` utilisait encore un ancien compteur externe. En même temps, `fetch-data.js` essayait d'utiliser Firebase. Les deux systèmes se mélangeaient, donc l'affichage pouvait rester à `-`, `0`, ou ne pas être en temps réel.

Maintenant :

- `script.js` gère seulement l'animation, la musique, le typewriter et Discord.
- `fetch-data.js` gère Firebase : vues, live, contenu du portfolio.
- `admin.js` gère le panel admin.

## Test rapide

1. Ouvre le site dans Chrome.
2. Ouvre aussi `/admin/`.
3. Connecte-toi avec ton compte admin Firebase.
4. Change le titre ou l'expérience.
5. Sauvegarde.
6. Le site public doit changer sans refresh.
7. Les vues doivent monter quand une nouvelle session visite le site.

Important : si tu ouvres le fichier directement avec `file://`, Firebase peut mal fonctionner. Utilise GitHub Pages ou un serveur local.
