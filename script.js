document.addEventListener('DOMContentLoaded', () => {
    const enterBtn = document.getElementById('enter-btn');
    const overlay = document.getElementById('enter-overlay');
    const mainContent = document.getElementById('main-content');
    const bgMusic = document.getElementById('bg-music');
    const bgVideo = document.getElementById('bg-video');
    const typewriterText = document.getElementById('typewriter-text');
    const dynamicIsland = document.getElementById('dynamic-island');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const visualizer = document.querySelector('.visualizer');

    // Phrases for the typewriter effect
    const phrases = ["Développeur FiveM", ".gg/tornadohub | FiveM Développement Service", "Passionné de Code LUA"];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    // --- Enter Site Logic ---
    enterBtn.addEventListener('click', () => {
        // Attempt to play music and video in sync
        bgMusic.volume = 0.4;
        bgMusic.currentTime = 0;
        if (bgVideo) bgVideo.currentTime = 0;
        bgMusic.play().catch(e => {
            console.warn("Audio play failed, the browser might have blocked it.", e);
        });
        if (bgVideo) bgVideo.play();

        // Add a class to button for animation
        enterBtn.style.transform = 'scale(0.95)';

        setTimeout(() => {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.style.display = 'none';
                mainContent.classList.add('active');

                // Show dynamic island and set playing state
                dynamicIsland.classList.add('island-playing');
                playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                visualizer.classList.remove('paused');

                // Start typing effect only after content is visible
                setTimeout(typeWriter, 500);
            }, 1000); // Wait for fade out
        }, 200);
    });

    // --- Typewriter Effect Logic ---
    function typeWriter() {
        const currentPhrase = phrases[phraseIndex];

        if (isDeleting) {
            typewriterText.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typewriterText.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
        }

        // Variable speed to make it look realistic
        let typeSpeed = isDeleting ? 40 : 80 + Math.random() * 50;

        if (!isDeleting && charIndex === currentPhrase.length) {
            typeSpeed = 2500; // Pause at end of word
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typeSpeed = 500; // Pause before typing next word
        }

        setTimeout(typeWriter, typeSpeed);
    }

    // --- Discord Real-Time Avatar (Lanyard) ---
    const discordId = "1508650378131144714";
    const avatarImg = document.querySelector('.avatar img');
    
    fetch(`https://api.lanyard.rest/v1/users/${discordId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data.discord_user) {
                const user = data.data.discord_user;
                if (user.avatar) {
                    const ext = user.avatar.startsWith('a_') ? 'gif' : 'png';
                    avatarImg.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=256`;
                }
            }
        })
        .catch(err => console.error("Erreur de récupération Discord :", err));


    // --- Dynamic Island Logic ---
    playPauseBtn.addEventListener('click', () => {
        if (bgMusic.paused) {
            if (bgVideo) bgVideo.currentTime = bgMusic.currentTime;
            bgMusic.play();
            if (bgVideo) bgVideo.play();
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            visualizer.classList.remove('paused');
        } else {
            bgMusic.pause();
            if (bgVideo) bgVideo.pause();
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            visualizer.classList.add('paused');
        }
    });

    // --- View Counter ---
    const viewCountEl = document.getElementById('view-count');
    if (viewCountEl) {
        // Vérifie si l'utilisateur a déjà visité la page durant cette session
        const hasVisited = sessionStorage.getItem('hasVisited');
        const endpoint = hasVisited 
            ? 'https://api.counterapi.dev/v1/CypherDev121/portfolio' 
            : 'https://api.counterapi.dev/v1/CypherDev121/portfolio/up';

        fetch(endpoint)
            .then(response => response.json())
            .then(data => {
                if(data.count !== undefined) {
                    viewCountEl.textContent = data.count;
                    if (!hasVisited) {
                        sessionStorage.setItem('hasVisited', 'true');
                    }
                }
            })
            .catch(err => {
                console.error("Erreur compteur de vues :", err);
                viewCountEl.textContent = "-";
            });
    }
});
