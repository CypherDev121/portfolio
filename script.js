document.addEventListener('DOMContentLoaded', () => {
    const enterBtn = document.getElementById('enter-btn');
    const overlay = document.getElementById('enter-overlay');
    const mainContent = document.getElementById('main-content');
    const bgMusic = document.getElementById('bg-music');
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
        // Attempt to play music
        bgMusic.volume = 0.4;
        bgMusic.play().catch(e => {
            console.warn("Audio play failed, the browser might have blocked it.", e);
        });

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

    // --- Dynamic Island Logic ---
    playPauseBtn.addEventListener('click', () => {
        if (bgMusic.paused) {
            bgMusic.play();
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            visualizer.classList.remove('paused');
        } else {
            bgMusic.pause();
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            visualizer.classList.add('paused');
        }
    });
});
