import { ANIMATION_CONFIG } from '../utils/constants.js';
import { Formatters } from '../utils/formatters.js';

/**
 * Gestionnaire de l'interface utilisateur
 */
export class UIManager {
    constructor() {
        this.modal = null;
        this.modalOverlay = null;
        this.currentModalCallback = null;
        this.init();
    }
    
    /**
     * Initialise le gestionnaire UI
     */
    init() {
        this.modalOverlay = document.getElementById('modalOverlay');
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
    }
    
    /**
     * Configure les écouteurs d'événements globaux
     */
    setupEventListeners() {
        // Fermeture du modal en cliquant sur l'overlay
        if (this.modalOverlay) {
            this.modalOverlay.addEventListener('click', () => this.closeModal());
        }
        
        // Gestion du thème
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }
    
    /**
     * Configure les raccourcis clavier
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl + N: Nouvelle tâche
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                document.getElementById('taskInput')?.focus();
            }
            
            // Ctrl + F: Focus recherche
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                document.getElementById('searchInput')?.focus();
            }
            
            // Ctrl + D: Toggle theme
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                this.toggleTheme();
            }
            
            // Escape: Fermer modal
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }
    
    /**
     * Affiche un modal
     */
    showModal(content, options = {}) {
        // Créer le modal s'il n'existe pas
        if (!this.modal) {
            this.createModal();
        }
        
        const { title = '', onConfirm = null, onCancel = null } = options;
        
        this.modal.querySelector('.modal-title').textContent = title;
        this.modal.querySelector('.modal-body').innerHTML = content;
        
        this.currentModalCallback = { onConfirm, onCancel };
        
        // Configurer les boutons
        const confirmBtn = this.modal.querySelector('.modal-confirm');
        const cancelBtn = this.modal.querySelector('.modal-cancel');
        
        confirmBtn.onclick = () => {
            if (onConfirm) onConfirm();
            this.closeModal();
        };
        
        cancelBtn.onclick = () => {
            if (onCancel) onCancel();
            this.closeModal();
        };
        
        this.modal.classList.remove('hidden');
        if (this.modalOverlay) {
            this.modalOverlay.classList.add('active');
        }
        
        // Animation
        this.modal.style.animation = 'slideInUp 0.3s ease';
    }
    
    /**
     * Crée le modal
     */
    createModal() {
        const modalHtml = `
            <div class="modal hidden" id="globalModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title"></h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body"></div>
                    <div class="modal-footer">
                        <button class="btn-secondary modal-cancel">Annuler</button>
                        <button class="btn-primary modal-confirm">Confirmer</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        this.modal = document.getElementById('globalModal');
        
        // Bouton de fermeture
        const closeBtn = this.modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => this.closeModal());
    }
    
    /**
     * Ferme le modal
     */
    closeModal() {
        if (this.modal) {
            this.modal.classList.add('hidden');
            if (this.modalOverlay) {
                this.modalOverlay.classList.remove('active');
            }
            this.currentModalCallback = null;
        }
    }
    
    /**
     * Affiche une confirmation
     */
    async confirm(message, title = 'Confirmation') {
        return new Promise((resolve) => {
            const content = `<p>${message}</p>`;
            this.showModal(content, {
                title,
                onConfirm: () => resolve(true),
                onCancel: () => resolve(false)
            });
        });
    }
    
    /**
     * Affiche un prompt personnalisé
     */
    async prompt(message, defaultValue = '') {
        return new Promise((resolve) => {
            const content = `
                <p>${message}</p>
                <input type="text" id="promptInput" class="modal-input" value="${defaultValue}">
            `;
            
            this.showModal(content, {
                title: 'Saisie',
                onConfirm: () => {
                    const input = document.getElementById('promptInput');
                    resolve(input ? input.value : null);
                },
                onCancel: () => resolve(null)
            });
        });
    }
    
    /**
     * Bascule le thème
     */
    toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        html.setAttribute('data-theme', newTheme);
        
        // Sauvegarder dans localStorage
        localStorage.setItem('theme', newTheme);
        
        // Mettre à jour l'icône
        const themeIcon = document.querySelector('#themeToggle i');
        if (themeIcon) {
            themeIcon.className = newTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
        
        // Animation
        this.animateThemeTransition();
    }
    
    /**
     * Anime la transition du thème
     */
    animateThemeTransition() {
        const transition = document.createElement('div');
        transition.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--bg-primary);
            opacity: 0;
            pointer-events: none;
            z-index: 9999;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(transition);
        
        setTimeout(() => {
            transition.style.opacity = '0.5';
            setTimeout(() => {
                transition.style.opacity = '0';
                setTimeout(() => {
                    transition.remove();
                }, 300);
            }, 150);
        }, 0);
    }
    
    /**
     * Met à jour les statistiques
     */
    updateStats(tasks) {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const active = total - completed;
        const completionRate = total === 0 ? 0 : (completed / total) * 100;
        
        // Mettre à jour les affichages
        const totalEl = document.getElementById('totalTasks');
        const activeEl = document.getElementById('activeTasks');
        const completedEl = document.getElementById('completedTasks');
        const rateEl = document.getElementById('completionRate');
        const progressBar = document.getElementById('progressBar');
        
        if (totalEl) totalEl.textContent = total;
        if (activeEl) activeEl.textContent = active;
        if (completedEl) completedEl.textContent = completed;
        if (rateEl) rateEl.textContent = `${Math.round(completionRate)}%`;
        if (progressBar) progressBar.style.width = `${completionRate}%`;
        
        // Mettre à jour les compteurs de filtres
        const allCount = document.getElementById('allCount');
        const activeCount = document.getElementById('activeCount');
        const completedCount = document.getElementById('completedCount');
        
        if (allCount) allCount.textContent = total;
        if (activeCount) activeCount.textContent = active;
        if (completedCount) completedCount.textContent = completed;
    }
    
    /**
     * Affiche une barre de chargement
     */
    showLoading() {
        const loader = document.createElement('div');
        loader.id = 'loadingOverlay';
        loader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        loader.innerHTML = `
            <div class="loading-spinner"></div>
        `;
        
        document.body.appendChild(loader);
    }
    
    /**
     * Cache la barre de chargement
     */
    hideLoading() {
        const loader = document.getElementById('loadingOverlay');
        if (loader) {
            loader.remove();
        }
    }
    
    /**
     * Affiche un message dans la barre de progression
     */
    updateProgressMessage(message) {
        const progressContainer = document.querySelector('.progress-container');
        if (progressContainer) {
            const existingMsg = progressContainer.querySelector('.progress-message');
            if (existingMsg) existingMsg.remove();
            
            const msgEl = document.createElement('div');
            msgEl.className = 'progress-message';
            msgEl.textContent = message;
            msgEl.style.cssText = `
                margin-top: 8px;
                font-size: 0.875rem;
                color: var(--text-secondary);
                text-align: center;
            `;
            progressContainer.parentNode.insertBefore(msgEl, progressContainer.nextSibling);
            
            setTimeout(() => msgEl.remove(), 3000);
        }
    }
}