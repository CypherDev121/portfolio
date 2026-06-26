import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
    getFirestore,
    doc,
    onSnapshot,
    serverTimestamp,
    setDoc,
    deleteDoc,
    collection,
    query,
    where,
    increment,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { firebaseConfig, isFirebaseConfigured } from "./firebase-config.js";

const defaults = {
    profileName: "CypherDev",
    location: "QUEBEC, ALMA",
    expYears: "7 Ans",
    expTitle: "Expertise Serveur & UI",
    expDesc: "Création de scripts personnalisés, optimisation serveur, développement d'interfaces interactives (UI), et gestion de bases de données. Plus de 7 ans d'expérience à façonner des expériences de jeu uniques sur FiveM.",
    songTitle: "JRK19 - DEVIN BOOKER (feat @larvfleuze)",
    skills: ["LUA", "HTML", "CSS", "SCSS", "JS", "VUE", "MYSQL", "NUI"]
};

function setText(id, value) {
    const el = document.getElementById(id);
    if (el && value !== undefined && value !== null && String(value).trim() !== "") el.textContent = value;
}

const skillImageMap = {
    lua: "assets/skills/lua.png",
    html: "assets/skills/html.png",
    html5: "assets/skills/html.png",
    css: "assets/skills/css.png",
    css3: "assets/skills/css.png",
    scss: "assets/skills/scss.png",
    sass: "assets/skills/scss.png",
    js: "assets/skills/js.png",
    javascript: "assets/skills/js.png",
    vue: "assets/skills/vue.png",
    vuejs: "assets/skills/vue.png",
    mysql: "assets/skills/mysql.png",
    sql: "assets/skills/mysql.png",
    nui: "assets/skills/nui.png"
};

function renderSkills(skills) {
    const list = document.getElementById("skills-list");
    if (!list || !Array.isArray(skills)) return;
    list.className = "skill-icons";
    list.innerHTML = "";
    skills.filter(Boolean).forEach((skill) => {
        const safe = String(skill).trim();
        const key = safe.toLowerCase().replace(/[^a-z0-9]/g, "");
        const card = document.createElement("article");
        card.className = "skill-icon-card";
        const img = document.createElement("img");
        img.src = skillImageMap[key] || "assets/skills/nui.png";
        img.alt = safe;
        img.loading = "lazy";
        const label = document.createElement("span");
        label.textContent = safe.toUpperCase();
        card.append(img, label);
        list.appendChild(card);
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

/* Fallback visible si Firebase n'est pas encore configuré.
   Important: ce compteur est local au navigateur. Pour de vraies vues globales,
   il faut configurer Firebase dans firebase-config.js. */
function localCounterFallback() {
    const viewCountEl = document.getElementById("view-count");
    const liveCountEl = document.getElementById("live-count");
    const key = "cypherdev_local_views";
    const visitedKey = "cypherdev_view_counted_local";
    let count = Number(localStorage.getItem(key) || "0");
    if (!sessionStorage.getItem(visitedKey)) {
        count += 1;
        localStorage.setItem(key, String(count));
        sessionStorage.setItem(visitedKey, "true");
    }
    if (viewCountEl) viewCountEl.textContent = count;
    if (liveCountEl) liveCountEl.textContent = "1 live";
}

if (!isFirebaseConfigured) {
    applyPortfolioData(defaults);
    localCounterFallback();
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

    // Compte une seule vue par onglet/session. Utilise increment() pour éviter les bugs de transaction/règles.
    if (!sessionStorage.getItem("cypherdev_view_counted")) {
        setDoc(statsRef, {
            total: increment(1),
            updatedAt: serverTimestamp()
        }, { merge: true })
        .then(() => sessionStorage.setItem("cypherdev_view_counted", "true"))
        .catch((error) => {
            console.error("Erreur compteur Firestore:", error);
            localCounterFallback();
        });
    }

    onSnapshot(statsRef, (snapshot) => {
        if (viewCountEl) viewCountEl.textContent = snapshot.exists() ? Number(snapshot.data().total || 0) : 0;
    }, (error) => {
        console.error("Erreur lecture vues:", error);
        localCounterFallback();
    });

    const sessionId = sessionStorage.getItem("cypherdev_session_id") || crypto.randomUUID();
    sessionStorage.setItem("cypherdev_session_id", sessionId);
    const presenceRef = doc(db, "presence", sessionId);

    const heartbeat = () => setDoc(presenceRef, {
        lastSeen: Date.now(),
        updatedAt: serverTimestamp(),
        page: location.pathname
    }, { merge: true }).catch((error) => console.error("Erreur présence:", error));

    heartbeat();
    const heartbeatTimer = setInterval(heartbeat, 15000);

    let unsubscribeLive = null;
    const refreshLiveListener = () => {
        if (unsubscribeLive) unsubscribeLive();
        const liveQuery = query(collection(db, "presence"), where("lastSeen", ">", Date.now() - 45000));
        unsubscribeLive = onSnapshot(liveQuery, (snapshot) => {
            if (liveCountEl) liveCountEl.textContent = `${Math.max(snapshot.size, 1)} live`;
        }, (error) => {
            console.error("Erreur live:", error);
            if (liveCountEl) liveCountEl.textContent = "1 live";
        });
    };

    refreshLiveListener();
    const liveTimer = setInterval(refreshLiveListener, 15000);

    window.addEventListener("beforeunload", () => {
        clearInterval(heartbeatTimer);
        clearInterval(liveTimer);
        if (unsubscribeLive) unsubscribeLive();
        deleteDoc(presenceRef).catch(() => {});
    });
}
