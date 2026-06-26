// Configuration Firebase partagée par le site et le panel admin.
// 1) Crée un projet Firebase
// 2) Active Authentication > Email/Password
// 3) Active Firestore Database
// 4) Colle ta config ici
export const firebaseConfig = {
    apiKey: "REMPLACE_CA_PAR_TON_API_KEY",
    authDomain: "ton-projet.firebaseapp.com",
    projectId: "ton-projet",
    storageBucket: "ton-projet.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};

export const ADMIN_EMAIL = "ton-email-admin@example.com";
export const isFirebaseConfigured = firebaseConfig.apiKey !== "REMPLACE_CA_PAR_TON_API_KEY";
