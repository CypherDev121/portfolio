import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ==========================================
// 🔴 ATTENTION: METTRE TA CONFIGURATION ICI
// (Doit être exactement la même que dans admin.js)
// ==========================================
const firebaseConfig = {
    apiKey: "REMPLACE_CA_PAR_TON_API_KEY",
    authDomain: "ton-projet.firebaseapp.com",
    projectId: "ton-projet",
    storageBucket: "ton-projet.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};

// Ne charge les données que si tu as mis ta propre clé d'API
if (firebaseConfig.apiKey !== "REMPLACE_CA_PAR_TON_API_KEY") {
    try {
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        async function loadPortfolioData() {
            const docRef = doc(db, "portfolio", "data");
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                
                if (data.expYears) {
                    const el = document.getElementById('exp-years-text');
                    if (el) el.textContent = data.expYears;
                }
                if (data.expTitle) {
                    const el = document.getElementById('exp-title-text');
                    if (el) el.textContent = data.expTitle;
                }
                if (data.expDesc) {
                    const el = document.getElementById('exp-desc-text');
                    if (el) el.textContent = data.expDesc;
                }
                if (data.songTitle) {
                    const el = document.getElementById('song-title-text');
                    if (el) el.textContent = data.songTitle;
                }
            }
        }

        // On lance le chargement
        loadPortfolioData().catch(console.error);
    } catch(err) {
        console.error("Erreur d'initialisation Firebase :", err);
    }
}
