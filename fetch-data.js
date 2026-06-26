import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
    getFirestore,
    doc,
    onSnapshot,
    runTransaction,
    serverTimestamp,
    setDoc,
    deleteDoc,
    collection,
    query,
    where
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { firebaseConfig, isFirebaseConfigured } from "./firebase-config.js";

const defaults = {
    profileName: "CypherDev",
    location: "QUEBEC, ALMA",
    expYears: "7 Ans",
    expTitle: "Expertise Serveur & UI",
    expDesc: "Création de scripts personnalisés, optimisation serveur, développement d'interfaces interactives (UI), et gestion de bases de données. Plus de 7 ans d'expérience à façonner des expériences de jeu uniques sur FiveM.",
    songTitle: "JRK19 - DEVIN BOOKER (feat @larvfleuze)",
    skills: ["LUA", "HTML", "CSS", "SCSS", "JS", "VUE"]
};

function setText(id, value) {
    const el = document.getElementById(id);
    if (el && value !== undefined && value !== null && String(value).trim() !== "") el.textContent = value;
}

function renderSkills(skills) {
    const list = document.getElementById("skills-list");
    if (!list || !Array.isArray(skills)) return;
    list.innerHTML = "";
    skills.filter(Boolean).forEach((skill) => {
        const span = document.createElement("span");
        const safe = String(skill).trim();
        span.className = `badge badge-${safe.toLowerCase().replace(/[^a-z0-9]/g, "") || "custom"}`;
        span.textContent = safe.toUpperCase();
        list.appendChild(span);
    });
}

function applyPortfolioData(data = {}) {
    const merged = { ...defaults, ...data };
    setText("profile-name", merged.profileName);
    setText("location-text", merged.location);
    setText("exp-years-text", merged.expYears);
    setText("exp-title-text", merged.expTitle);
    setText("exp-desc-text", merged.expDesc);
    setText("song-title-text", merged.songTitle);
    renderSkills(merged.skills);
}

function fallbackCounter() {
    const viewCountEl = document.getElementById("view-count");
    const liveCountEl = document.getElementById("live-count");
    if (liveCountEl) liveCountEl.textContent = "1 live";
    if (!viewCountEl) return;

    const hasVisited = sessionStorage.getItem("cypherdev_has_visited");
    const endpoint = hasVisited
        ? "https://api.counterapi.dev/v1/CypherDev121/portfolio"
        : "https://api.counterapi.dev/v1/CypherDev121/portfolio/up";

    fetch(endpoint)
        .then((response) => response.json())
        .then((data) => {
            viewCountEl.textContent = data.count ?? "-";
            if (!hasVisited) sessionStorage.setItem("cypherdev_has_visited", "true");
        })
        .catch(() => {
            viewCountEl.textContent = "-";
        });
}

if (!isFirebaseConfigured) {
    applyPortfolioData(defaults);
    fallbackCounter();
} else {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    onSnapshot(doc(db, "portfolio", "data"), (snapshot) => {
        applyPortfolioData(snapshot.exists() ? snapshot.data() : defaults);
    }, (error) => {
        console.error("Erreur chargement portfolio:", error);
        applyPortfolioData(defaults);
    });

    const statsRef = doc(db, "stats", "views");
    const viewCountEl = document.getElementById("view-count");
    const liveCountEl = document.getElementById("live-count");
    const sessionId = sessionStorage.getItem("cypherdev_session_id") || crypto.randomUUID();
    sessionStorage.setItem("cypherdev_session_id", sessionId);

    if (!sessionStorage.getItem("cypherdev_view_counted")) {
        runTransaction(db, async (transaction) => {
            const stats = await transaction.get(statsRef);
            const current = stats.exists() ? Number(stats.data().total || 0) : 0;
            transaction.set(statsRef, { total: current + 1, updatedAt: serverTimestamp() }, { merge: true });
        }).then(() => sessionStorage.setItem("cypherdev_view_counted", "true"))
          .catch((error) => console.error("Erreur compteur Firestore:", error));
    }

    onSnapshot(statsRef, (snapshot) => {
        if (viewCountEl) viewCountEl.textContent = snapshot.exists() ? (snapshot.data().total || 0) : 0;
    });

    const presenceRef = doc(db, "presence", sessionId);
    const heartbeat = () => setDoc(presenceRef, { lastSeen: Date.now(), updatedAt: serverTimestamp() }, { merge: true }).catch(console.error);
    heartbeat();
    const heartbeatTimer = setInterval(heartbeat, 25000);

    const liveQuery = query(collection(db, "presence"), where("lastSeen", ">", Date.now() - 60000));
    onSnapshot(liveQuery, (snapshot) => {
        if (liveCountEl) liveCountEl.textContent = `${snapshot.size} live`;
    }, () => {
        if (liveCountEl) liveCountEl.textContent = "1 live";
    });

    window.addEventListener("beforeunload", () => {
        clearInterval(heartbeatTimer);
        deleteDoc(presenceRef).catch(() => {});
    });
}
