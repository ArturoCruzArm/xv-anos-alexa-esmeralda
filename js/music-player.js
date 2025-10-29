// ========================================
// REPRODUCTOR DE MÚSICA AUTOMÁTICO
// Canción: "Hoy me siento tan afortunada"
// ========================================

(function() {
    'use strict';

    let audio = null;
    let isPlaying = false;

    // Inicializar reproductor cuando cargue el DOM
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🎵 Inicializando reproductor de música...');
        initMusicPlayer();
    });

    function initMusicPlayer() {
        // Crear elemento de audio
        audio = document.createElement('audio');
        audio.src = 'audio/cancion-boda.mp3';
        audio.loop = true; // Repetir en bucle
        audio.volume = 0.5; // Volumen al 50%
        audio.id = 'backgroundMusic';

        // Agregar al DOM
        document.body.appendChild(audio);

        // Crear controles flotantes
        createMusicControls();

        // Intentar reproducir automáticamente
        // Nota: Algunos navegadores bloquean autoplay, por eso usamos un botón
        tryAutoplay();

        console.log('✅ Reproductor de música inicializado');
    }

    function createMusicControls() {
        // Crear contenedor de controles
        const controls = document.createElement('div');
        controls.id = 'musicControls';
        controls.className = 'music-controls';
        controls.innerHTML = `
            <div class="music-player">
                <div class="music-icon">
                    <span class="music-note">🎵</span>
                </div>
                <div class="music-info">
                    <p class="song-title">Hoy me siento tan afortunada</p>
                    <p class="song-status" id="musicStatus">Pausada</p>
                </div>
                <div class="music-buttons">
                    <button id="playPauseBtn" class="music-btn" title="Reproducir/Pausar">
                        <span id="playPauseIcon">▶️</span>
                    </button>
                    <button id="muteBtn" class="music-btn" title="Silenciar/Activar">
                        <span id="muteIcon">🔊</span>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(controls);

        // Agregar event listeners
        document.getElementById('playPauseBtn').addEventListener('click', togglePlayPause);
        document.getElementById('muteBtn').addEventListener('click', toggleMute);

        // Animación de nota musical cuando está reproduciendo
        audio.addEventListener('play', () => {
            document.querySelector('.music-note').classList.add('playing');
            updateStatus('Reproduciendo');
        });

        audio.addEventListener('pause', () => {
            document.querySelector('.music-note').classList.remove('playing');
            updateStatus('Pausada');
        });
    }

    function tryAutoplay() {
        // Intentar reproducir automáticamente
        const playPromise = audio.play();

        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    // Autoplay exitoso
                    isPlaying = true;
                    updatePlayButton(true);
                    console.log('🎵 Música reproduciéndose automáticamente');
                })
                .catch(error => {
                    // Autoplay bloqueado por el navegador
                    console.log('⚠️ Autoplay bloqueado. Usuario debe dar clic para reproducir.');
                    isPlaying = false;
                    updatePlayButton(false);

                    // Mostrar mensaje sutil
                    showAutoplayMessage();
                });
        }
    }

    function togglePlayPause() {
        if (isPlaying) {
            audio.pause();
            isPlaying = false;
            updatePlayButton(false);
        } else {
            audio.play();
            isPlaying = true;
            updatePlayButton(true);
        }
    }

    function updatePlayButton(playing) {
        const icon = document.getElementById('playPauseIcon');
        if (playing) {
            icon.textContent = '⏸️';
        } else {
            icon.textContent = '▶️';
        }
    }

    function toggleMute() {
        audio.muted = !audio.muted;
        const icon = document.getElementById('muteIcon');
        if (audio.muted) {
            icon.textContent = '🔇';
        } else {
            icon.textContent = '🔊';
        }
    }

    function updateStatus(status) {
        const statusElement = document.getElementById('musicStatus');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }

    function showAutoplayMessage() {
        // Crear mensaje temporal
        const message = document.createElement('div');
        message.className = 'autoplay-message';
        message.innerHTML = `
            <p>🎵 Haz clic en ▶️ para escuchar la música</p>
        `;
        document.body.appendChild(message);

        // Remover después de 5 segundos
        setTimeout(() => {
            message.style.opacity = '0';
            setTimeout(() => message.remove(), 500);
        }, 5000);
    }

})();
