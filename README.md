# Portfolio CypherDev

## Ce qui a été corrigé/amélioré
- Le portfolio charge maintenant les données en temps réel via Firestore `onSnapshot`.
- Le compteur de vues utilise Firestore avec transaction et n'incrémente qu'une fois par session.
- Ajout d'un compteur `live` pour les visiteurs présents sur le site.
- Ajout d'un vrai panel admin à l'URL `/admin/` au lieu d'utiliser directement `admin.html`.
- Le panel admin est protégé par Firebase Authentication et par les règles Firestore.
- Correction de la structure HTML du portfolio et du footer.

## Configuration obligatoire
Modifie `firebase-config.js` :

```js
export const firebaseConfig = { ...ta config Firebase... };
export const ADMIN_EMAIL = "ton-email@gmail.com";
```

Dans Firebase :
1. Active **Authentication > Email/Password**.
2. Crée ton compte admin avec le même email que `ADMIN_EMAIL`.
3. Active **Firestore Database**.
4. Colle ces règles Firestore en remplaçant l'email :

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
      allow delete: if isAdmin();
    }

    match /presence/{sessionId} {
      allow read: if true;
      allow create, update, delete: if true;
    }
  }
}
```

Important : sur un site statique comme GitHub Pages, aucun panel ne peut être 100% secret côté frontend. La vraie sécurité vient de Firebase Auth + règles Firestore. Les utilisateurs peuvent voir les fichiers, mais ils ne peuvent pas modifier les données sans le compte admin.

## URL
- Site : `/portfolio/`
- Panel admin : `/portfolio/admin/`
