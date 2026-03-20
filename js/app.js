import { TaskView } from './views/TaskView.js';
import { UIManager } from './views/UIManager.js';
import { TaskController } from './controllers/TaskController.js';
import { SettingsController } from './controllers/SettingsController.js';
import { StatsView } from './views/StatsView.js';
import { StorageService } from './services/StorageService.js';
import { MusicService } from './services/MusicService.js';
import { THEMES } from './utils/constants.js';

/**
 * Point d'entrée principal de l'application
 */
class App {
    constructor() {
        this.uiManager = null;
        this.taskView = null;
        this.taskController = null;
        this.storageService = null;
        this.settingsController = null;
        this.statsView = null;
        this.musicService = null;
    }
    
    /**
     * Initialise l'application
     */
    async init() {
        console.log('🚀 Démarrage de To-Do List Pro...');
        
        // Initialiser les services
        this.storageService = new StorageService();
        
        // Initialiser le service de musique
        this.musicService = new MusicService();
        
        // Initialiser le contrôleur des paramètres (avant tout)
        this.settingsController = new SettingsController(this.musicService);
        
        // Initialiser les vues
        this.uiManager = new UIManager();
        this.taskView = new TaskView('tasksList');
        
        // Initialiser la vue des statistiques
        this.statsView = new StatsView('statsModalContent');
        
        // Initialiser le contrôleur
        this.taskController = new TaskController(this.taskView, this.uiManager);
        
        // Synchroniser le thème avec les paramètres
        this.syncThemeWithSettings();
        
        // Écouter les changements de paramètres
        this.settingsController.addListener((settings) => {
            this.onSettingsChanged(settings);
        });
        
        // Configurer les événements des statistiques
        this.setupStatsEvents();
        
        // Vérifier l'espace de stockage
        this.checkStorage();
        
        // Configurer les notifications
        this.setupNotifications();
        
        // Démarrer les rappels automatiques
        this.startReminders();
        
        // Configurer les événements de l'interface
        this.setupUIEvents();
        
        console.log('✅ Application prête !');
    }
    
    /**
     * Configure les événements pour les statistiques
     */
    setupStatsEvents() {
        // Rendre les éléments de statistiques cliquables
        const statItems = document.querySelectorAll('.stat-item');
        const statsModal = document.getElementById('statsModal');
        const statsModalClose = document.querySelector('.stats-modal-close');
        const modalOverlay = document.getElementById('modalOverlay');
        
        if (statItems.length > 0) {
            statItems.forEach(item => {
                item.style.cursor = 'pointer';
                item.title = 'Cliquez pour voir les statistiques détaillées';
                item.addEventListener('click', () => {
                    this.showDetailedStats();
                });
            });
        }
        
        // Fermeture du modal des statistiques
        if (statsModalClose) {
            statsModalClose.addEventListener('click', () => {
                if (statsModal) statsModal.classList.add('hidden');
                if (modalOverlay) modalOverlay.classList.remove('active');
            });
        }
        
        // Fermer en cliquant sur l'overlay
        if (modalOverlay) {
            modalOverlay.addEventListener('click', () => {
                if (statsModal) statsModal.classList.add('hidden');
            });
        }
    }
    
    /**
     * Affiche les statistiques détaillées
     */
    showDetailedStats() {
        const statsModal = document.getElementById('statsModal');
        const modalOverlay = document.getElementById('modalOverlay');
        
        if (!statsModal || !this.taskController?.tasks) return;
        
        // Rendre les statistiques
        this.statsView.render(this.taskController.tasks);
        
        // Afficher le modal
        statsModal.classList.remove('hidden');
        if (modalOverlay) modalOverlay.classList.add('active');
        
        // Gérer la fermeture avec Escape
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                statsModal.classList.add('hidden');
                if (modalOverlay) modalOverlay.classList.remove('active');
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }
    
    /**
     * Synchronise le thème avec les paramètres
     */
    syncThemeWithSettings() {
        const theme = this.settingsController.get('theme');
        const html = document.documentElement;
        
        if (theme === 'dark') {
            html.setAttribute('data-theme', 'dark');
            this.updateThemeIcon('dark');
        } else if (theme === 'light') {
            html.setAttribute('data-theme', 'light');
            this.updateThemeIcon('light');
        } else {
            html.setAttribute('data-theme', 'auto');
            this.updateThemeIcon('auto');
        }
    }
    
    /**
     * Met à jour l'icône du thème
     */
    updateThemeIcon(theme) {
        const themeIcon = document.querySelector('#themeToggle i');
        if (themeIcon) {
            if (theme === 'dark') {
                themeIcon.className = 'fas fa-sun';
            } else if (theme === 'light') {
                themeIcon.className = 'fas fa-moon';
            } else {
                // Auto mode - détecter le thème système
                const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    }
    
    /**
     * Appelé quand les paramètres changent
     */
    onSettingsChanged(settings) {
        console.log('Paramètres mis à jour:', settings);
        
        // Mettre à jour l'interface en fonction des paramètres
        if (settings.compactView) {
            document.body.classList.add('compact-view');
        } else {
            document.body.classList.remove('compact-view');
        }
        
        if (!settings.animations) {
            document.body.classList.add('no-animations');
        } else {
            document.body.classList.remove('no-animations');
        }
        
        // Mettre à jour la taille de police
        const sizes = {
            small: '14px',
            medium: '16px',
            large: '18px'
        };
        document.documentElement.style.fontSize = sizes[settings.fontSize] || '16px';
        
        // Mettre à jour l'icône du thème
        this.updateThemeIcon(settings.theme);
        
        // Rafraîchir l'affichage des tâches si nécessaire
        if (this.taskController) {
            this.taskController.refreshUI();
        }
    }
    
    /**
     * Configure les événements de l'interface
     */
    setupUIEvents() {
        // Bouton de thème rapide (si cliqué directement)
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            // Remplacer l'écouteur existant pour utiliser SettingsController
            const newToggle = themeToggle.cloneNode(true);
            themeToggle.parentNode.replaceChild(newToggle, themeToggle);
            newToggle.addEventListener('click', () => {
                this.settingsController.toggleTheme();
            });
        }
        
        // Gestion du modal de paramètres
        const settingsBtn = document.getElementById('settingsBtn');
        const settingsModal = document.getElementById('settingsModal');
        
        if (settingsBtn && settingsModal) {
            settingsBtn.addEventListener('click', () => {
                // Charger les paramètres actuels dans le modal
                this.settingsController.loadSettingsToModal();
                settingsModal.classList.remove('hidden');
                const overlay = document.getElementById('modalOverlay');
                if (overlay) overlay.classList.add('active');
            });
        }
        
        // Fermeture des modals
        const closeModal = () => {
            const settingsModalEl = document.getElementById('settingsModal');
            const editModal = document.getElementById('editModal');
            const statsModal = document.getElementById('statsModal');
            if (settingsModalEl) settingsModalEl.classList.add('hidden');
            if (editModal) editModal.classList.add('hidden');
            if (statsModal) statsModal.classList.add('hidden');
            const overlay = document.getElementById('modalOverlay');
            if (overlay) overlay.classList.remove('active');
        };
        
        // Boutons de fermeture des modals
        const settingsCloseBtns = document.querySelectorAll('.settings-close, .settings-cancel');
        settingsCloseBtns.forEach(btn => {
            btn.addEventListener('click', closeModal);
        });
        
        // Sauvegarde des paramètres
        const settingsSaveBtn = document.querySelector('.settings-save');
        if (settingsSaveBtn) {
            settingsSaveBtn.addEventListener('click', () => {
                this.settingsController.saveSettingsFromModal();
                closeModal();
            });
        }
        
        // Export des paramètres
        const exportSettingsBtn = document.getElementById('exportSettingsBtn');
        if (exportSettingsBtn) {
            exportSettingsBtn.addEventListener('click', () => {
                this.settingsController.export();
            });
        }
        
        // Import des paramètres
        const importSettingsBtn = document.getElementById('importSettingsBtn');
        if (importSettingsBtn) {
            importSettingsBtn.addEventListener('click', () => {
                this.settingsController.import();
            });
        }
        
        // Reset des paramètres
        const resetSettingsBtn = document.getElementById('resetSettingsBtn');
        if (resetSettingsBtn) {
            resetSettingsBtn.addEventListener('click', async () => {
                if (confirm('Réinitialiser tous les paramètres par défaut ?')) {
                    this.settingsController.reset();
                    this.settingsController.loadSettingsToModal();
                    this.showToast('Paramètres réinitialisés', 'success');
                }
            });
        }
        
        // Écouter les clics sur l'overlay
        const overlay = document.getElementById('modalOverlay');
        if (overlay) {
            overlay.addEventListener('click', closeModal);
        }
        
        // Écouter Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
    }
    
    /**
     * Vérifie l'espace de stockage disponible
     */
    checkStorage() {
        const space = this.storageService.checkStorageSpace();
        if (space && space.percentage > 80) {
            this.showToast(
                `⚠️ Espace de stockage : ${Math.round(space.percentage)}% utilisé`,
                'warning',
                5000
            );
        }
    }
    
    /**
     * Affiche un toast
     */
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.getElementById('toast');
        if (!toast) return;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        const iconSpan = toast.querySelector('.toast-icon');
        const messageSpan = toast.querySelector('.toast-message');
        
        if (iconSpan) iconSpan.innerHTML = icons[type] || icons.info;
        if (messageSpan) messageSpan.textContent = message;
        
        toast.className = `toast ${type}`;
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, duration);
    }
    
    /**
     * Configure les notifications
     */
    setupNotifications() {
        // Demander la permission au clic sur le bouton
        const notifBtn = document.getElementById('notificationBtn');
        if (notifBtn) {
            notifBtn.addEventListener('click', async () => {
                const notificationService = this.taskController?.notificationService;
                if (notificationService) {
                    const granted = await notificationService.requestPermission();
                    if (granted) {
                        notificationService.showNotification('Notifications activées', {
                            body: 'Vous recevrez des rappels pour vos tâches'
                        });
                        this.showToast('Notifications activées', 'success');
                    }
                }
            });
        }
        
        // Mettre à jour le badge de notification
        this.updateNotificationBadge();
    }
    
    /**
     * Met à jour le badge des notifications
     */
    updateNotificationBadge() {
        const badge = document.getElementById('notificationBadge');
        if (!badge) return;
        
        // Compter les tâches en retard
        const overdueTasks = this.taskController?.tasks?.filter(t => 
            !t.completed && t.isOverdue && t.isOverdue()
        ) || [];
        
        const count = overdueTasks.length;
        badge.textContent = count;
        
        if (count > 0) {
            badge.style.display = 'flex';
            badge.style.animation = 'pulse 1s ease infinite';
        } else {
            badge.style.display = 'none';
        }
    }
    
    /**
     * Démarre les rappels automatiques
     */
    startReminders() {
        // Vérifier les tâches en retard toutes les heures
        setInterval(() => {
            if (!this.taskController?.tasks) return;
            
            // Vérifier si les notifications sont activées
            const notificationsEnabled = this.settingsController?.get('notifications');
            
            if (notificationsEnabled) {
                const overdueTasks = this.taskController.tasks.filter(t => 
                    !t.completed && t.isOverdue && t.isOverdue()
                );
                
                if (overdueTasks.length > 0 && this.taskController.notificationService?.permission) {
                    this.taskController.notificationService.showNotification(
                        'Tâches en retard',
                        {
                            body: `Vous avez ${overdueTasks.length} tâche${overdueTasks.length > 1 ? 's' : ''} en retard`,
                            tag: 'overdue_reminder'
                        }
                    );
                }
            }
            
            this.updateNotificationBadge();
        }, 3600000); // 1 heure
        
        // Sauvegarde automatique toutes les 5 minutes (si activée)
        setInterval(() => {
            const autoSaveEnabled = this.settingsController?.get('autoSave');
            if (autoSaveEnabled && this.taskController) {
                this.taskController.saveTasks();
                console.log('💾 Sauvegarde automatique effectuée');
            }
        }, 300000); // 5 minutes
    }
    
    /**
     * Nettoyage avant fermeture
     */
    cleanup() {
        console.log('🧹 Nettoyage de l\'application...');
        // Sauvegarde finale
        if (this.taskController) {
            this.taskController.saveTasks();
        }
        
        // Arrêter la musique si elle joue
        if (this.musicService && this.musicService.isPlaying) {
            this.musicService.pause();
        }
    }
}

// Démarrer l'application quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    
    // Sauvegarde avant de quitter
    window.addEventListener('beforeunload', () => {
        app.cleanup();
    });
    
    app.init().catch(error => {
        console.error('Erreur lors de l\'initialisation:', error);
        
        // Afficher un message d'erreur à l'utilisateur
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            text-align: center;
            z-index: 10000;
            max-width: 90%;
        `;
        errorDiv.innerHTML = `
            <h3>❌ Erreur de chargement</h3>
            <p>Impossible de démarrer l'application.</p>
            <p style="font-size: 12px; color: #666; margin-top: 10px;">${error.message}</p>
            <button onclick="location.reload()" style="
                margin-top: 15px;
                padding: 8px 16px;
                background: #6366f1;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
            ">Recharger</button>
        `;
        document.body.appendChild(errorDiv);
    });
});

// Export pour les tests (optionnel)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { App };
}