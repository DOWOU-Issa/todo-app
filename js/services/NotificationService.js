import { NOTIFICATION_MESSAGES } from '../utils/constants.js';

/**
 * Service de gestion des notifications
 */
export class NotificationService {
    constructor() {
        this.permission = false;
        this.toastTimeout = null;
        this.init();
    }
    
    /**
     * Initialise le service
     */
    init() {
        // Vérifier si les notifications sont supportées
        if ('Notification' in window) {
            this.checkPermission();
        }
        
        // Créer le conteneur de toast s'il n'existe pas
        this.createToastContainer();
    }
    
    /**
     * Crée le conteneur pour les toasts
     */
    createToastContainer() {
        if (!document.getElementById('toastContainer')) {
            const container = document.createElement('div');
            container.id = 'toastContainer';
            container.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
            `;
            document.body.appendChild(container);
        }
    }
    
    /**
     * Vérifie la permission des notifications
     */
    async checkPermission() {
        if (Notification.permission === 'granted') {
            this.permission = true;
        } else if (Notification.permission !== 'denied') {
            // Ne pas demander automatiquement, attendre l'action utilisateur
            this.permission = false;
        }
    }
    
    /**
     * Demande la permission
     */
    async requestPermission() {
        if (!('Notification' in window)) {
            this.showToast('Notifications non supportées par votre navigateur', 'error');
            return false;
        }
        
        const permission = await Notification.requestPermission();
        this.permission = permission === 'granted';
        
        if (this.permission) {
            this.showToast('Notifications activées !', 'success');
        }
        
        return this.permission;
    }
    
    /**
     * Affiche une notification système
     */
    showNotification(title, options = {}) {
        if (!this.permission) return;
        
        try {
            const defaultOptions = {
                body: '',
                icon: '/assets/icons/icon-192x192.png',
                badge: '/assets/icons/icon-72x72.png',
                silent: false,
                vibrate: [200, 100, 200]
            };
            
            const notificationOptions = { ...defaultOptions, ...options };
            const notification = new Notification(title, notificationOptions);
            
            // Auto-fermeture après 5 secondes
            setTimeout(() => notification.close(), 5000);
            
            return notification;
        } catch (error) {
            console.error('Erreur lors de l\'affichage de la notification:', error);
        }
    }
    
    /**
     * Affiche un toast (notification temporaire)
     */
    showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        // Icône selon le type
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 1.2rem;">${icons[type] || icons.info}</span>
                <span>${message}</span>
                <button class="toast-close" style="
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 1.2rem;
                    color: inherit;
                    margin-left: 8px;
                ">×</button>
            </div>
        `;
        
        toast.style.cssText = `
            background: var(--bg-primary, white);
            color: var(--text-primary, black);
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideInRight 0.3s ease;
            border-left: 4px solid ${this.getTypeColor(type)};
            min-width: 250px;
            max-width: 350px;
        `;
        
        container.appendChild(toast);
        
        // Bouton de fermeture
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.removeToast(toast));
        
        // Auto-fermeture
        const timeout = setTimeout(() => this.removeToast(toast), duration);
        toast.dataset.timeout = timeout;
        
        return toast;
    }
    
    /**
     * Retire un toast
     */
    removeToast(toast) {
        if (toast.dataset.timeout) {
            clearTimeout(parseInt(toast.dataset.timeout));
        }
        
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }
    
    /**
     * Obtient la couleur selon le type
     */
    getTypeColor(type) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        return colors[type] || colors.info;
    }
    
    /**
     * Affiche un message de succès
     */
    success(message) {
        this.showToast(message, 'success');
        if (this.permission) {
            this.showNotification('Succès', { body: message });
        }
    }
    
    /**
     * Affiche un message d'erreur
     */
    error(message) {
        this.showToast(message, 'error');
    }
    
    /**
     * Affiche un avertissement
     */
    warning(message) {
        this.showToast(message, 'warning');
    }
    
    /**
     * Affiche une information
     */
    info(message) {
        this.showToast(message, 'info');
    }
    
    /**
     * Notification pour une tâche à échoir
     */
    notifyUpcomingTask(task) {
        const dueDate = new Date(task.dueDate);
        const now = new Date();
        const timeLeft = dueDate - now;
        
        // Notification 1 heure avant
        if (timeLeft > 0 && timeLeft < 3600000 && timeLeft > 0) {
            this.showNotification('Tâche imminente !', {
                body: `"${task.title}" est prévue pour ${dueDate.toLocaleTimeString()}`,
                tag: `task_${task.id}`
            });
        }
    }
    
    /**
     * Notification de rappel quotidien
     */
    dailyReminder(tasks) {
        const activeTasks = tasks.filter(t => !t.completed);
        
        if (activeTasks.length > 0) {
            this.showNotification('Rappel quotidien', {
                body: `Vous avez ${activeTasks.length} tâche${activeTasks.length > 1 ? 's' : ''} à accomplir aujourd'hui !`,
                tag: 'daily_reminder'
            });
        }
    }
}