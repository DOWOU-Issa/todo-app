/**
 * Service de gestion de la musique d'ambiance
 */
export class MusicService {
    constructor() {
        this.audio = null;
        this.isPlaying = false;
        this.volume = 0.5;
        this.musicUrl = 'assets/sounds/jazz-cafe-music.mp3';
        this.init();
    }
    
    /**
     * Initialise le service
     */
    init() {
        this.createAudioElement();
        this.loadSavedState();
        this.setupUI();
    }
    
    /**
     * Crée l'élément audio
     */
    createAudioElement() {
        this.audio = new Audio(this.musicUrl);
        this.audio.loop = true;
        this.audio.volume = this.volume;
        
        // Gérer les erreurs de chargement
        this.audio.addEventListener('error', (e) => {
            console.error('Erreur de chargement de la musique:', e);
        });
        
        // Auto-play après interaction utilisateur
        document.addEventListener('click', () => {
            if (this.isPlaying && this.audio.paused) {
                this.audio.play().catch(console.log);
            }
        }, { once: true });
    }
    
    /**
     * Charge l'état sauvegardé
     */
    loadSavedState() {
        const saved = localStorage.getItem('todo_music');
        if (saved) {
            const state = JSON.parse(saved);
            this.isPlaying = state.isPlaying || false;
            this.volume = state.volume !== undefined ? state.volume : 0.5;
            if (this.audio) {
                this.audio.volume = this.volume;
            }
            
            if (this.isPlaying) {
                this.play();
            }
        }
    }
    
    /**
     * Sauvegarde l'état
     */
    saveState() {
        localStorage.setItem('todo_music', JSON.stringify({
            isPlaying: this.isPlaying,
            volume: this.volume
        }));
    }
    
    /**
     * Joue la musique
     */
    play() {
        if (!this.audio) return;
        
        this.audio.play().catch(error => {
            console.log('Lecture automatique bloquée par le navigateur', error);
            this.isPlaying = false;
        });
        
        this.isPlaying = true;
        this.saveState();
        this.updateUI();
    }
    
    /**
     * Met en pause la musique
     */
    pause() {
        if (!this.audio) return;
        
        this.audio.pause();
        this.isPlaying = false;
        this.saveState();
        this.updateUI();
    }
    
    /**
     * Bascule lecture/pause
     */
    toggle() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    /**
     * Définit le volume
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.audio) {
            this.audio.volume = this.volume;
        }
        this.saveState();
        this.updateUI();
        
        // Mettre à jour le slider dans les paramètres s'il existe
        const musicVolumeSlider = document.getElementById('musicVolume');
        if (musicVolumeSlider) {
            musicVolumeSlider.value = this.volume * 100;
        }
    }
    
    /**
     * Active/désactive la musique
     */
    setEnabled(enabled) {
        if (enabled && !this.isPlaying) {
            this.play();
        } else if (!enabled && this.isPlaying) {
            this.pause();
        }
    }
    
    /**
     * Crée l'interface de contrôle
     */
    setupUI() {
        // Créer le bouton de contrôle de musique
        const headerActions = document.querySelector('.header-actions');
        if (!headerActions) return;
        
        // Vérifier si le contrôle existe déjà
        if (document.querySelector('.music-control')) return;
        
        // Créer le conteneur
        const musicControl = document.createElement('div');
        musicControl.className = 'music-control';
        musicControl.style.position = 'relative';
        
        // Créer le bouton
        const musicBtn = document.createElement('button');
        musicBtn.className = 'icon-btn music-toggle';
        musicBtn.setAttribute('aria-label', 'Musique d\'ambiance');
        musicBtn.innerHTML = '<i class="fas fa-music"></i>';
        
        // Créer le contrôle de volume (caché par défaut)
        const volumeControl = document.createElement('div');
        volumeControl.className = 'volume-control hidden';
        volumeControl.innerHTML = `
            <div class="volume-slider-container">
                <i class="fas fa-volume-down"></i>
                <input type="range" class="volume-slider" min="0" max="100" value="${this.volume * 100}">
                <i class="fas fa-volume-up"></i>
            </div>
        `;
        
        musicControl.appendChild(musicBtn);
        musicControl.appendChild(volumeControl);
        headerActions.appendChild(musicControl);
        
        // Événements
        musicBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
            
            // Mettre à jour le toggle dans les paramètres
            const musicToggle = document.getElementById('musicToggle');
            if (musicToggle) {
                musicToggle.checked = this.isPlaying;
            }
        });
        
        // Afficher/masquer le contrôle de volume au survol
        musicControl.addEventListener('mouseenter', () => {
            volumeControl.classList.remove('hidden');
        });
        
        musicControl.addEventListener('mouseleave', () => {
            volumeControl.classList.add('hidden');
        });
        
        // Contrôle du volume
        const volumeSlider = volumeControl.querySelector('.volume-slider');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                const newVolume = parseInt(e.target.value) / 100;
                this.setVolume(newVolume);
                
                // Mettre à jour le slider dans les paramètres
                const musicVolumeSlider = document.getElementById('musicVolume');
                if (musicVolumeSlider) {
                    musicVolumeSlider.value = newVolume * 100;
                }
            });
        }
        
        this.musicBtn = musicBtn;
        this.updateUI();
    }
    
    /**
     * Met à jour l'icône
     */
    updateUI() {
        if (!this.musicBtn) return;
        
        if (this.isPlaying) {
            this.musicBtn.innerHTML = '<i class="fas fa-music" style="color: var(--primary-light);"></i>';
            this.musicBtn.classList.add('active');
            this.musicBtn.style.animation = 'pulse 1s ease infinite';
        } else {
            this.musicBtn.innerHTML = '<i class="fas fa-music"></i>';
            this.musicBtn.classList.remove('active');
            this.musicBtn.style.animation = 'none';
        }
    }
}

export default MusicService;