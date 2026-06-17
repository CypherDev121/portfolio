import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ==========================================
// 🔴 ATTENTION: METTRE TA CONFIGURATION ICI
// ==========================================
// Crée un projet sur https://console.firebase.google.com/
// Va dans les paramètres du projet et copie la config ici :
const firebaseConfig = {
    apiKey: "REMPLACE_CA_PAR_TON_API_KEY",
    authDomain: "ton-projet.firebaseapp.com",
    projectId: "ton-projet",
    storageBucket: "ton-projet.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Éléments du DOM
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const portfolioForm = document.getElementById('portfolio-form');
const loginError = document.getElementById('login-error');
const saveStatus = document.getElementById('save-status');

// Champs du formulaire
const expYearsInput = document.getElementById('exp-years');
const expTitleInput = document.getElementById('exp-title');
const expDescInput = document.getElementById('exp-desc');
const songTitleInput = document.getElementById('song-title');

// Vérifier l'état de connexion
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Connecté
        loginSection.style.display = 'none';
        dashboardSection.style.display = 'block';
        await chargerDonnees();
    } else {
        // Déconnecté
        loginSection.style.display = 'block';
        dashboardSection.style.display = 'none';
    }
});

// Connexion
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            loginError.textContent = "";
        })
        .catch((error) => {
            console.error(error);
            loginError.textContent = "Email ou mot de passe incorrect.";
        });
});

// Déconnexion
logoutBtn.addEventListener('click', () => {
    signOut(auth);
});

// Charger les données existantes de Firestore
async function chargerDonnees() {
    try {
        const docRef = doc(db, "portfolio", "data");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            if(data.expYears) expYearsInput.value = data.expYears;
            if(data.expTitle) expTitleInput.value = data.expTitle;
            if(data.expDesc) expDescInput.value = data.expDesc;
            if(data.songTitle) songTitleInput.value = data.songTitle;
        }
    } catch (error) {
        console.error("Erreur de chargement :", error);
    }
}

// Sauvegarder les modifications dans Firestore
portfolioForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    saveStatus.textContent = "Sauvegarde en cours...";
    saveStatus.style.color = "#fff";
    
    try {
        await setDoc(doc(db, "portfolio", "data"), {
            expYears: expYearsInput.value,
            expTitle: expTitleInput.value,
            expDesc: expDescInput.value,
            songTitle: songTitleInput.value
        }, { merge: true }); // Merge true permet de ne pas écraser d'autres champs non gérés ici
        
        saveStatus.textContent = "Modifications sauvegardées avec succès !";
        saveStatus.style.color = "#00ffcc";
        setTimeout(() => saveStatus.textContent = "", 3000);
    } catch (error) {
        console.error("Erreur de sauvegarde :", error);
        saveStatus.textContent = "Erreur lors de la sauvegarde.";
        saveStatus.style.color = "#ff4d4d";
    }
});
