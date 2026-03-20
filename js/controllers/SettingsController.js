import { THEMES, ANIMATION_CONFIG } from '../utils/constants.js';

/**
 * Contrôleur des paramètres utilisateur
 */
export class SettingsController {
    constructor(musicService = null) {
        this.musicService = musicService;
        this.settings = {
            theme: 'auto', // light, dark, auto
            fontSize: 'medium',
            animations: true,
            compactView: false,
            notifications: true,
            reminderTime: 60,
            autoSave: true,
            autoSaveInterval: 300000
        };
        
        this.listeners = [];
        this.load();
        this.apply();
        this.setupEventListeners();
    }
    
    /**
     * Configure les écouteurs d'événements
     */
    setupEventListeners() {
        // Bouton paramètres
        const settingsBtn = document.getElementById('settingsBtn');
        const settingsModal = document.getElementById('settingsModal');
        
        if (settingsBtn && settingsModal) {
            settingsBtn.addEventListener('click', () => {
                this.loadSettingsToModal();
                settingsModal.classList.remove('hidden');
                document.getElementById('modalOverlay').classList.add('active');
            });
        }
        
        // Fermeture du modal
        const closeBtns = document.querySelectorAll('.settings-close, .settings-cancel');
        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                settingsModal.classList.add('hidden');
                document.getElementById('modalOverlay').classList.remove('active');
            });
        });
        
        // Sauvegarde
        const saveBtn = document.querySelector('.settings-save');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveSettingsFromModal();
                settingsModal.classList.add('hidden');
                document.getElementById('modalOverlay').classList.remove('active');
                this.notifyListeners();
            });
        }
        
        // Export
        const exportBtn = document.getElementById('exportSettingsBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.export());
        }
        
        // Import
        const importBtn = document.getElementById('importSettingsBtn');
        if (importBtn) {
            importBtn.addEventListener('click', () => this.import());
        }
        
        // Reset
        const resetBtn = document.getElementById('resetSettingsBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', async () => {
                if (confirm('Réinitialiser tous les paramètres par défaut ?')) {
                    this.reset();
                    this.loadSettingsToModal();
                    this.notifyListeners();
                }
            });
        }
        
        // Thème toggle (bouton en haut)
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }
    
    /**
     * Charge les paramètres sauvegardés
     */
    load() {
        const saved = localStorage.getItem('todo_settings');
        if (saved) {
            try {
                const loaded = JSON.parse(saved);
                this.settings = { ...this.settings, ...loaded };
            } catch (error) {
                console.error('Error loading settings:', error);
            }
        }
    }
    
    /**
     * Sauvegarde les paramètres
     */
    save() {
        localStorage.setItem('todo_settings', JSON.stringify(this.settings));
    }
    
    /**
     * Applique les paramètres
     */
    apply() {
        // Appliquer le thème
        this.applyTheme();
        
        // Appliquer la taille de police
        this.applyFontSize();
        
        // Appliquer l'affichage compact
        this.applyCompactView();
        
        // Appliquer les animations
        this.applyAnimations();
        
        // Mettre à jour l'icône du thème
        this.updateThemeIcon();
    }
    
    /**
     * Applique le thème
     */
    applyTheme() {
        const html = document.documentElement;
        
        if (this.settings.theme === 'dark') {
            html.setAttribute('data-theme', 'dark');
            // Appliquer les variables CSS pour le dark mode
            document.documentElement.style.setProperty('--bg-primary', '#1f2937');
            document.documentElement.style.setProperty('--bg-secondary', '#111827');
            document.documentElement.style.setProperty('--text-primary', '#f9fafb');
        } else if (this.settings.theme === 'light') {
            html.setAttribute('data-theme', 'light');
            // Appliquer les variables CSS pour le light mode
            document.documentElement.style.setProperty('--bg-primary', '#ffffff');
            document.documentElement.style.setProperty('--bg-secondary', '#f9fafb');
            document.documentElement.style.setProperty('--text-primary', '#111827');
        } else {
            // Auto - suivre la préférence système
            html.setAttribute('data-theme', 'auto');
            this.applySystemTheme();
            
            // Écouter les changements de thème système
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
                if (this.settings.theme === 'auto') {
                    this.applySystemTheme();
                }
            });
        }
    }
    
    /**
     * Applique le thème système
     */
    applySystemTheme() {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (isDark) {
            document.documentElement.style.setProperty('--bg-primary', '#1f2937');
            document.documentElement.style.setProperty('--bg-secondary', '#111827');
            document.documentElement.style.setProperty('--text-primary', '#f9fafb');
        } else {
            document.documentElement.style.setProperty('--bg-primary', '#ffffff');
            document.documentElement.style.setProperty('--bg-secondary', '#f9fafb');
            document.documentElement.style.setProperty('--text-primary', '#111827');
        }
    }
    
    /**
     * Met à jour l'icône du thème
     */
    updateThemeIcon() {
        const themeIcon = document.querySelector('#themeToggle i');
        if (themeIcon) {
            if (this.settings.theme === 'dark') {
                themeIcon.className = 'fas fa-sun';
            } else {
                themeIcon.className = 'fas fa-moon';
            }
        }
    }
    
    /**
     * Bascule le thème
     */
    toggleTheme() {
        if (this.settings.theme === 'light') {
            this.settings.theme = 'dark';
        } else if (this.settings.theme === 'dark') {
            this.settings.theme = 'auto';
        } else {
            this.settings.theme = 'light';
        }
        
        this.save();
        this.apply();
        this.notifyListeners();
        
        // Afficher un toast
        this.showToast(`Thème ${this.getThemeName(this.settings.theme)} activé`, 'success');
    }
    
    /**
     * Obtient le nom du thème
     */
    getThemeName(theme) {
        const names = { light: 'Clair', dark: 'Sombre', auto: 'Auto' };
        return names[theme] || 'Auto';
    }
    
    /**
     * Affiche un toast temporaire
     */
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        if (!toast) return;
        
        const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
        
        const iconSpan = toast.querySelector('.toast-icon');
        const messageSpan = toast.querySelector('.toast-message');
        
        if (iconSpan) iconSpan.innerHTML = icons[type] || icons.info;
        if (messageSpan) messageSpan.textContent = message;
        
        toast.className = `toast ${type}`;
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }
    
    /**
     * Applique la taille de police
     */
    applyFontSize() {
        const sizes = {
            small: '14px',
            medium: '16px',
            large: '18px'
        };
        
        document.documentElement.style.fontSize = sizes[this.settings.fontSize] || '16px';
    }
    
    /**
     * Applique l'affichage compact
     */
    applyCompactView() {
        if (this.settings.compactView) {
            document.body.classList.add('compact-view');
        } else {
            document.body.classList.remove('compact-view');
        }
    }
    
    /**
     * Applique les animations
     */
    applyAnimations() {
        if (!this.settings.animations) {
            document.body.classList.add('no-animations');
        } else {
            document.body.classList.remove('no-animations');
        }
    }
    
    /**
     * Charge les paramètres de musique dans le modal
     */
    loadMusicSettingsToModal() {
        if (!this.musicService) return;
        
        const musicToggle = document.getElementById('musicToggle');
        const musicVolume = document.getElementById('musicVolume');
        
        if (musicToggle) {
            musicToggle.checked = this.musicService.isPlaying;
            // Supprimer l'ancien listener pour éviter les doublons
            const newToggle = musicToggle.cloneNode(true);
            musicToggle.parentNode.replaceChild(newToggle, musicToggle);
            newToggle.addEventListener('change', (e) => {
                this.musicService.setEnabled(e.target.checked);
                // Mettre à jour l'icône dans le header
                this.updateMusicButtonIcon();
            });
        }
        
        if (musicVolume) {
            musicVolume.value = this.musicService.volume * 100;
            // Supprimer l'ancien listener pour éviter les doublons
            const newVolume = musicVolume.cloneNode(true);
            musicVolume.parentNode.replaceChild(newVolume, musicVolume);
            newVolume.addEventListener('input', (e) => {
                const newVolumeValue = parseInt(e.target.value) / 100;
                this.musicService.setVolume(newVolumeValue);
            });
        }
    }
    
    /**
     * Met à jour l'icône du bouton musique dans le header
     */
    updateMusicButtonIcon() {
        const musicBtn = document.querySelector('.music-toggle');
        if (musicBtn && this.musicService) {
            if (this.musicService.isPlaying) {
                musicBtn.innerHTML = '<i class="fas fa-music" style="color: var(--primary-light);"></i>';
                musicBtn.classList.add('active');
            } else {
                musicBtn.innerHTML = '<i class="fas fa-music"></i>';
                musicBtn.classList.remove('active');
            }
        }
    }
    
    /**
     * Charge les paramètres dans le modal
     */
    loadSettingsToModal() {
        const themeSelect = document.getElementById('themeSelect');
        const fontSizeSelect = document.getElementById('fontSizeSelect');
        const animationsToggle = document.getElementById('animationsToggle');
        const compactViewToggle = document.getElementById('compactViewToggle');
        const notificationsToggle = document.getElementById('notificationsToggle');
        const reminderTime = document.getElementById('reminderTime');
        const autoSaveToggle = document.getElementById('autoSaveToggle');
        
        if (themeSelect) themeSelect.value = this.settings.theme;
        if (fontSizeSelect) fontSizeSelect.value = this.settings.fontSize;
        if (animationsToggle) animationsToggle.checked = this.settings.animations;
        if (compactViewToggle) compactViewToggle.checked = this.settings.compactView;
        if (notificationsToggle) notificationsToggle.checked = this.settings.notifications;
        if (reminderTime) reminderTime.value = this.settings.reminderTime;
        if (autoSaveToggle) autoSaveToggle.checked = this.settings.autoSave;
        
        // Charger les paramètres de musique
        this.loadMusicSettingsToModal();
    }
    
    /**
     * Sauvegarde les paramètres depuis le modal
     */
    saveSettingsFromModal() {
        const themeSelect = document.getElementById('themeSelect');
        const fontSizeSelect = document.getElementById('fontSizeSelect');
        const animationsToggle = document.getElementById('animationsToggle');
        const compactViewToggle = document.getElementById('compactViewToggle');
        const notificationsToggle = document.getElementById('notificationsToggle');
        const reminderTime = document.getElementById('reminderTime');
        const autoSaveToggle = document.getElementById('autoSaveToggle');
        
        if (themeSelect) this.settings.theme = themeSelect.value;
        if (fontSizeSelect) this.settings.fontSize = fontSizeSelect.value;
        if (animationsToggle) this.settings.animations = animationsToggle.checked;
        if (compactViewToggle) this.settings.compactView = compactViewToggle.checked;
        if (notificationsToggle) this.settings.notifications = notificationsToggle.checked;
        if (reminderTime) this.settings.reminderTime = parseInt(reminderTime.value);
        if (autoSaveToggle) this.settings.autoSave = autoSaveToggle.checked;
        
        // Les paramètres de musique sont déjà sauvegardés via les événements
        // Pas besoin de les sauvegarder ici car ils sont gérés par MusicService
        
        this.save();
        this.apply();
        this.showToast('Paramètres enregistrés', 'success');
    }
    
    /**
     * Obtient un paramètre
     */
    get(key) {
        return this.settings[key];
    }
    
    /**
     * Définit un paramètre
     */
    set(key, value) {
        this.settings[key] = value;
        this.save();
        this.apply();
        this.notifyListeners();
        return this.settings[key];
    }
    
    /**
     * Ajoute un listener
     */
    addListener(callback) {
        this.listeners.push(callback);
    }
    
    /**
     * Notifie les listeners
     */
    notifyListeners() {
        this.listeners.forEach(callback => {
            try {
                callback(this.settings);
            } catch (error) {
                console.error('Error in settings listener:', error);
            }
        });
    }
    
    /**
     * Réinitialise les paramètres
     */
    reset() {
        this.settings = {
            theme: 'auto',
            fontSize: 'medium',
            animations: true,
            compactView: false,
            notifications: true,
            reminderTime: 60,
            autoSave: true,
            autoSaveInterval: 300000
        };
        
        this.save();
        this.apply();
        
        // Réinitialiser aussi la musique si elle existe
        if (this.musicService) {
            this.musicService.setEnabled(false);
            this.musicService.setVolume(0.5);
        }
        
        this.loadSettingsToModal();
        this.notifyListeners();
        this.showToast('Paramètres réinitialisés', 'success');
    }
    
    /**
     * Exporte les paramètres
     */
    export() {
        const data = JSON.stringify(this.settings, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `todo_settings_${new Date().toISOString().slice(0, 19)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('Paramètres exportés', 'success');
    }
    
    /**
     * Importe les paramètres
     */
    import() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const imported = JSON.parse(event.target.result);
                    this.settings = { ...this.settings, ...imported };
                    this.save();
                    this.apply();
                    this.loadSettingsToModal();
                    this.notifyListeners();
                    this.showToast('Paramètres importés', 'success');
                } catch (error) {
                    this.showToast('Erreur lors de l\'import', 'error');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }
}

export default SettingsController;