import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, serverTimestamp, collection, query, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { firebaseConfig, ADMIN_EMAIL, isFirebaseConfigured } from "./firebase-config.js";

const $ = (id) => document.getElementById(id);
const setupSection = $("setup-section");
const loginSection = $("login-section");
const dashboardSection = $("dashboard-section");
const loginForm = $("login-form");
const logoutBtn = $("logout-btn");
const portfolioForm = $("portfolio-form");
const loginError = $("login-error");
const saveStatus = $("save-status");

const fields = {
    profileName: $("profile-name"),
    location: $("location"),
    skills: $("skills"),
    expYears: $("exp-years"),
    expTitle: $("exp-title"),
    expDesc: $("exp-desc"),
    songTitle: $("song-title")
};

if (!isFirebaseConfigured) {
    setupSection.hidden = false;
    loginSection.hidden = true;
    dashboardSection.hidden = true;
} else {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    onAuthStateChanged(auth, (user) => {
        const allowed = user && (!ADMIN_EMAIL || ADMIN_EMAIL === "ton-email-admin@example.com" || user.email === ADMIN_EMAIL);
        if (allowed) {
            setupSection.hidden = true;
            loginSection.hidden = true;
            dashboardSection.hidden = false;
            $("admin-email").textContent = `Connecté : ${user.email}`;
            listenPortfolio(db);
            listenStats(db);
        } else {
            if (user) signOut(auth);
            setupSection.hidden = true;
            loginSection.hidden = false;
            dashboardSection.hidden = true;
        }
    });

    loginForm?.addEventListener("submit", async (event) => {
        event.preventDefault();
        loginError.textContent = "";
        try {
            await signInWithEmailAndPassword(auth, $("email").value.trim(), $("password").value);
        } catch (error) {
            console.error(error);
            loginError.textContent = "Email ou mot de passe incorrect.";
        }
    });

    logoutBtn?.addEventListener("click", () => signOut(auth));

    portfolioForm?.addEventListener("submit", async (event) => {
        event.preventDefault();
        saveStatus.textContent = "Sauvegarde en cours...";
        saveStatus.style.color = "#fff";
        try {
            await setDoc(doc(db, "portfolio", "data"), {
                profileName: fields.profileName.value.trim(),
                location: fields.location.value.trim(),
                skills: fields.skills.value.split(",").map((skill) => skill.trim()).filter(Boolean),
                expYears: fields.expYears.value.trim(),
                expTitle: fields.expTitle.value.trim(),
                expDesc: fields.expDesc.value.trim(),
                songTitle: fields.songTitle.value.trim(),
                updatedAt: serverTimestamp()
            }, { merge: true });
            saveStatus.textContent = "Sauvegardé. Le site se met à jour en direct.";
            saveStatus.style.color = "#00ffcc";
            setTimeout(() => saveStatus.textContent = "", 3500);
        } catch (error) {
            console.error(error);
            saveStatus.textContent = "Erreur : vérifie tes règles Firestore / ton compte admin.";
            saveStatus.style.color = "#ff4d4d";
        }
    });

    function listenPortfolio(db) {
        onSnapshot(doc(db, "portfolio", "data"), (snapshot) => {
            if (!snapshot.exists()) return;
            const data = snapshot.data();
            if (data.profileName) fields.profileName.value = data.profileName;
            if (data.location) fields.location.value = data.location;
            if (Array.isArray(data.skills)) fields.skills.value = data.skills.join(", ");
            if (data.expYears) fields.expYears.value = data.expYears;
            if (data.expTitle) fields.expTitle.value = data.expTitle;
            if (data.expDesc) fields.expDesc.value = data.expDesc;
            if (data.songTitle) fields.songTitle.value = data.songTitle;
            if (data.updatedAt?.toDate) $("admin-updated-at").textContent = data.updatedAt.toDate().toLocaleString("fr-CA");
        });
    }

    function listenStats(db) {
        onSnapshot(doc(db, "stats", "views"), (snapshot) => {
            $("admin-total-views").textContent = snapshot.exists() ? Number(snapshot.data().total || 0) : 0;
        }, () => {
            $("admin-total-views").textContent = "Erreur";
        });

        let unsubscribeLive = null;
        const refreshLive = () => {
            if (unsubscribeLive) unsubscribeLive();
            const liveQuery = query(collection(db, "presence"), where("lastSeen", ">", Date.now() - 45000));
            unsubscribeLive = onSnapshot(liveQuery, (snapshot) => {
                $("admin-live-users").textContent = Math.max(snapshot.size, 0);
            }, () => {
                $("admin-live-users").textContent = "Erreur";
            });
        };
        refreshLive();
        setInterval(refreshLive, 15000);
    }
}
