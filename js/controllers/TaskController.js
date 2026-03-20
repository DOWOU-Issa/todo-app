import { Task } from '../models/Task.js';
import { StorageService } from '../services/StorageService.js';
import { NotificationService } from '../services/NotificationService.js';
import { ExportService } from '../services/ExportService.js';
import { debounce } from '../utils/debounce.js';
import { ANIMATION_CONFIG } from '../utils/constants.js';

/**
 * Contrôleur principal des tâches
 */
export class TaskController {
    constructor(taskView, uiManager) {
        this.tasks = [];
        this.taskView = taskView;
        this.uiManager = uiManager;
        this.storageService = new StorageService();
        this.notificationService = new NotificationService();
        this.exportService = new ExportService();
        
        this.currentFilter = 'all';
        this.currentSearchTerm = '';
        this.currentSort = 'date-desc';
        
        this.init();
    }
    
    /**
     * Initialise le contrôleur
     */
    init() {
        // Charger les tâches sauvegardées
        this.loadTasks();
        
        // Configurer les événements
        this.setupEventListeners();
        
        // Configurer la sauvegarde automatique
        this.debouncedSave = debounce(() => this.saveTasks(), ANIMATION_CONFIG.DEBOUNCE_DELAY);
        
        // Configurer la synchronisation multi-onglets
        this.storageService.setupSync();
        this.storageService.addListener((event, data) => {
            if (event === 'sync') {
                this.tasks = data;
                this.refreshUI();
                this.notificationService.info('Synchronisation effectuée');
            }
        });
    }
    
    /**
     * Charge les tâches
     */
    loadTasks() {
        this.tasks = this.storageService.loadTasks();
        this.refreshUI();
    }
    
    /**
     * Sauvegarde les tâches
     */
    saveTasks() {
        this.storageService.saveTasks(this.tasks);
        this.storageService.createBackup(this.tasks);
    }
    
    /**
     * Rafraîchit l'interface
     */
    refreshUI() {
        this.taskView.render(this.getSortedTasks(), this.currentFilter, this.currentSearchTerm);
        this.uiManager.updateStats(this.tasks);
    }
    
    /**
     * Obtient les tâches triées
     */
    getSortedTasks() {
        const tasks = [...this.tasks];
        
        switch (this.currentSort) {
            case 'date-asc':
                return tasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            case 'date-desc':
                return tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            case 'priority':
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return tasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
            case 'alpha-asc':
                return tasks.sort((a, b) => a.title.localeCompare(b.title));
            case 'alpha-desc':
                return tasks.sort((a, b) => b.title.localeCompare(a.title));
            default:
                return tasks;
        }
    }
    
    /**
     * Configure les écouteurs d'événements
     */
    setupEventListeners() {
        // Ajout de tâche
        const addBtn = document.getElementById('addTaskBtn');
        const taskInput = document.getElementById('taskInput');
        
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addTask());
        }
        
        if (taskInput) {
            taskInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.addTask();
            });
        }
        
        // Suggestions rapides
        document.querySelectorAll('.suggestion-badge').forEach(badge => {
            badge.addEventListener('click', () => {
                const suggestion = badge.dataset.suggestion;
                if (suggestion && taskInput) {
                    taskInput.value = suggestion;
                    taskInput.focus();
                }
            });
        });
        
        // Filtres
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                if (filter) {
                    this.currentFilter = filter;
                    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.refreshUI();
                }
            });
        });
        
        // Recherche
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', debounce((e) => {
                this.currentSearchTerm = e.target.value;
                this.refreshUI();
            }, 300));
            
            // Bouton clear search
            const clearSearch = document.getElementById('clearSearchBtn');
            if (clearSearch) {
                clearSearch.addEventListener('click', () => {
                    searchInput.value = '';
                    this.currentSearchTerm = '';
                    this.refreshUI();
                    clearSearch.classList.add('hidden');
                });
                
                searchInput.addEventListener('input', () => {
                    if (searchInput.value) {
                        clearSearch.classList.remove('hidden');
                    } else {
                        clearSearch.classList.add('hidden');
                    }
                });
            }
        }
        
        // Tri
        const sortBtn = document.getElementById('sortBtn');
        const sortMenu = document.getElementById('sortMenu');
        
        if (sortBtn) {
            sortBtn.addEventListener('click', () => {
                if (sortMenu) {
                    sortMenu.classList.toggle('hidden');
                }
            });
        }
        
        if (sortMenu) {
            sortMenu.querySelectorAll('button').forEach(btn => {
                btn.addEventListener('click', () => {
                    const sortType = btn.dataset.sort;
                    if (sortType) {
                        this.currentSort = sortType;
                        this.refreshUI();
                        sortMenu.classList.add('hidden');
                        
                        // Mettre à jour le texte du bouton
                        const sortSpan = sortBtn.querySelector('span');
                        if (sortSpan) {
                            sortSpan.textContent = btn.textContent.trim();
                        }
                    }
                });
            });
        }
        
        // Fermer le menu de tri au clic ailleurs
        document.addEventListener('click', (e) => {
            if (sortMenu && !sortMenu.contains(e.target) && !sortBtn?.contains(e.target)) {
                sortMenu.classList.add('hidden');
            }
        });
        
        // Supprimer les tâches terminées
        const clearCompletedBtn = document.getElementById('clearCompletedBtn');
        if (clearCompletedBtn) {
            clearCompletedBtn.addEventListener('click', () => this.clearCompletedTasks());
        }
        
        // Tout effacer
        const clearAllBtn = document.getElementById('clearAllBtn');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => this.clearAllTasks());
        }
        
        // Export - Utilise ExportService
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportTasks());
        }
        
        // Import
        const importBtn = document.getElementById('importBtn');
        if (importBtn) {
            importBtn.addEventListener('click', () => this.importTasks());
        }
        
        // Événements de la vue
        this.taskView.onTaskToggle = (taskId, completed) => this.toggleTask(taskId, completed);
        this.taskView.onTaskDelete = (taskId) => this.deleteTask(taskId);
        this.taskView.onTaskEdit = (taskId) => this.editTask(taskId);
        this.taskView.onSubtaskToggle = (taskId, subtaskId, completed) => this.toggleSubtask(taskId, subtaskId, completed);
    }
    
    /**
     * Ajoute une tâche
     */
    addTask() {
        const input = document.getElementById('taskInput');
        const title = input?.value.trim();
        
        if (!title) {
            this.notificationService.warning('Veuillez saisir une tâche');
            input?.focus();
            return;
        }
        
        try {
            const task = new Task({ title });
            this.tasks.unshift(task);
            this.saveTasks();
            this.refreshUI();
            
            input.value = '';
            input.focus();
            
            this.notificationService.success('Tâche ajoutée avec succès');
            
            // Animation sur la nouvelle tâche
            const newTaskEl = document.querySelector(`[data-task-id="${task.id}"]`);
            if (newTaskEl) {
                newTaskEl.style.animation = 'slideInUp 0.3s ease';
            }
        } catch (error) {
            this.notificationService.error(error.message);
        }
    }
    
    /**
     * Bascule l'état d'une tâche
     */
    toggleTask(taskId, completed) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.toggleComplete();
            this.saveTasks();
            this.refreshUI();
            
            if (completed) {
                this.notificationService.success(`✅ "${task.title}" terminée !`);
                
                // Vérifier si c'est la dernière tâche
                const remainingTasks = this.tasks.filter(t => !t.completed).length;
                if (remainingTasks === 0 && this.tasks.length > 0) {
                    this.notificationService.showNotification('Bravo !', {
                        body: 'Vous avez terminé toutes vos tâches ! 🎉'
                    });
                }
            }
        }
    }
    
    /**
     * Supprime une tâche
     */
    async deleteTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        const confirmed = await this.uiManager.confirm(
            `Voulez-vous vraiment supprimer la tâche "${task.title}" ?`,
            'Confirmer la suppression'
        );
        
        if (confirmed) {
            const index = this.tasks.findIndex(t => t.id === taskId);
            if (index !== -1) {
                this.tasks.splice(index, 1);
                this.saveTasks();
                this.refreshUI();
                this.notificationService.success('Tâche supprimée');
            }
        }
    }
    
    /**
     * Édite une tâche
     */
    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        // Remplir le modal d'édition
        const editInput = document.getElementById('editTaskInput');
        const editDesc = document.getElementById('editTaskDesc');
        const editPriority = document.getElementById('editPriority');
        const editCategory = document.getElementById('editCategory');
        const editDueDate = document.getElementById('editDueDate');
        
        if (editInput) editInput.value = task.title;
        if (editDesc) editDesc.value = task.description || '';
        if (editPriority) editPriority.value = task.priority;
        if (editCategory) editCategory.value = task.category;
        if (editDueDate && task.dueDate) {
            editDueDate.value = new Date(task.dueDate).toISOString().slice(0, 16);
        }
        
        // Afficher le modal
        const modal = document.getElementById('editModal');
        const overlay = document.getElementById('modalOverlay');
        
        if (modal && overlay) {
            modal.classList.remove('hidden');
            overlay.classList.add('active');
            
            // Gérer la sauvegarde
            const saveBtn = modal.querySelector('.modal-save');
            const cancelBtn = modal.querySelector('.modal-cancel');
            const closeBtn = modal.querySelector('.modal-close');
            
            const saveHandler = () => {
                try {
                    if (editInput) task.updateTitle(editInput.value);
                    if (editDesc) task.updateDescription(editDesc.value);
                    if (editPriority) task.updatePriority(editPriority.value);
                    if (editCategory) task.updateCategory(editCategory.value);
                    if (editDueDate && editDueDate.value) {
                        task.updateDueDate(editDueDate.value);
                    }
                    
                    this.saveTasks();
                    this.refreshUI();
                    this.notificationService.success('Tâche mise à jour');
                    
                    modal.classList.add('hidden');
                    overlay.classList.remove('active');
                    
                    // Nettoyer les événements
                    saveBtn?.removeEventListener('click', saveHandler);
                    cancelBtn?.removeEventListener('click', closeHandler);
                    closeBtn?.removeEventListener('click', closeHandler);
                } catch (error) {
                    this.notificationService.error(error.message);
                }
            };
            
            const closeHandler = () => {
                modal.classList.add('hidden');
                overlay.classList.remove('active');
                saveBtn?.removeEventListener('click', saveHandler);
                cancelBtn?.removeEventListener('click', closeHandler);
                closeBtn?.removeEventListener('click', closeHandler);
            };
            
            saveBtn?.addEventListener('click', saveHandler);
            cancelBtn?.addEventListener('click', closeHandler);
            closeBtn?.addEventListener('click', closeHandler);
        }
    }
    
    /**
     * Bascule une sous-tâche
     */
    toggleSubtask(taskId, subtaskId, completed) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.toggleSubtask(subtaskId);
            this.saveTasks();
            this.refreshUI();
        }
    }
    
    /**
     * Supprime les tâches terminées
     */
    async clearCompletedTasks() {
        const completedTasks = this.tasks.filter(t => t.completed);
        
        if (completedTasks.length === 0) {
            this.notificationService.info('Aucune tâche terminée à supprimer');
            return;
        }
        
        const confirmed = await this.uiManager.confirm(
            `Supprimer ${completedTasks.length} tâche${completedTasks.length > 1 ? 's' : ''} terminée${completedTasks.length > 1 ? 's' : ''} ?`,
            'Confirmer'
        );
        
        if (confirmed) {
            this.tasks = this.tasks.filter(t => !t.completed);
            this.saveTasks();
            this.refreshUI();
            this.notificationService.success('Tâches terminées supprimées');
        }
    }
    
    /**
     * Supprime toutes les tâches
     */
    async clearAllTasks() {
        if (this.tasks.length === 0) {
            this.notificationService.info('Aucune tâche à supprimer');
            return;
        }
        
        const confirmed = await this.uiManager.confirm(
            `⚠️ Supprimer définitivement toutes les ${this.tasks.length} tâches ? Cette action est irréversible.`,
            'Attention !'
        );
        
        if (confirmed) {
            this.tasks = [];
            this.saveTasks();
            this.refreshUI();
            this.notificationService.warning('Toutes les tâches ont été supprimées');
        }
    }
    
    /**
     * Exporte les tâches (multi-formats avec ExportService)
     */
    async exportTasks() {
        if (this.tasks.length === 0) {
            this.notificationService.warning('Aucune tâche à exporter');
            return;
        }
        
        // Afficher le choix du format
        const format = await this.showExportFormatDialog();
        if (!format) return;
        
        try {
            await this.exportService.exportTasks(this.tasks, format, { pretty: true });
            this.notificationService.success(`Export ${format.toUpperCase()} réussi`);
        } catch (error) {
            console.error('Erreur export:', error);
            this.notificationService.error(`Erreur d'export: ${error.message}`);
        }
    }
    
    /**
     * Affiche la boîte de dialogue pour choisir le format d'export
     */
    showExportFormatDialog() {
        return new Promise((resolve) => {
            // Créer un modal temporaire
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            `;
            
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 450px; background: var(--bg-primary); border-radius: var(--radius-lg); overflow: hidden; animation: slideInUp 0.3s ease;">
                    <div class="modal-header" style="padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                        <h3 style="margin: 0; font-size: 1.25rem;">📤 Exporter les tâches</h3>
                        <button class="modal-close" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-tertiary);">&times;</button>
                    </div>
                    <div class="modal-body" style="padding: 1.5rem;">
                        <p style="margin-bottom: 1rem; color: var(--text-secondary);">Choisissez le format d'export :</p>
                        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                            <button class="export-format-btn" data-format="json" style="padding: 0.875rem; text-align: left; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 1rem; width: 100%;">
                                <span style="font-size: 1.5rem;">📄</span>
                                <div style="flex: 1;">
                                    <div style="font-weight: 600; margin-bottom: 0.25rem;">JSON</div>
                                    <div style="font-size: 0.75rem; color: var(--text-secondary);">Format standard, réimportable dans l'application</div>
                                </div>
                                <span style="color: var(--text-tertiary);">→</span>
                            </button>
                            <button class="export-format-btn" data-format="csv" style="padding: 0.875rem; text-align: left; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 1rem; width: 100%;">
                                <span style="font-size: 1.5rem;">📊</span>
                                <div style="flex: 1;">
                                    <div style="font-weight: 600; margin-bottom: 0.25rem;">CSV</div>
                                    <div style="font-size: 0.75rem; color: var(--text-secondary);">Pour Excel / Google Sheets</div>
                                </div>
                                <span style="color: var(--text-tertiary);">→</span>
                            </button>
                            <button class="export-format-btn" data-format="txt" style="padding: 0.875rem; text-align: left; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 1rem; width: 100%;">
                                <span style="font-size: 1.5rem;">📝</span>
                                <div style="flex: 1;">
                                    <div style="font-weight: 600; margin-bottom: 0.25rem;">TXT</div>
                                    <div style="font-size: 0.75rem; color: var(--text-secondary);">Format texte simple, lisible par tout éditeur</div>
                                </div>
                                <span style="color: var(--text-tertiary);">→</span>
                            </button>
                            <button class="export-format-btn" data-format="html" style="padding: 0.875rem; text-align: left; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 1rem; width: 100%;">
                                <span style="font-size: 1.5rem;">🌐</span>
                                <div style="flex: 1;">
                                    <div style="font-weight: 600; margin-bottom: 0.25rem;">HTML</div>
                                    <div style="font-size: 0.75rem; color: var(--text-secondary);">Page web imprimable et stylisée</div>
                                </div>
                                <span style="color: var(--text-tertiary);">→</span>
                            </button>
                            <button class="export-format-btn" data-format="pdf" style="padding: 0.875rem; text-align: left; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 1rem; width: 100%;">
                                <span style="font-size: 1.5rem;">📑</span>
                                <div style="flex: 1;">
                                    <div style="font-weight: 600; margin-bottom: 0.25rem;">PDF</div>
                                    <div style="font-size: 0.75rem; color: var(--text-secondary);">Document professionnel, partage facile</div>
                                </div>
                                <span style="color: var(--text-tertiary);">→</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            const closeModal = () => {
                modal.remove();
                resolve(null);
            };
            
            // Fermeture avec le bouton X
            const closeBtn = modal.querySelector('.modal-close');
            if (closeBtn) closeBtn.addEventListener('click', closeModal);
            
            // Fermeture en cliquant sur l'overlay
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
            
            // Sélection du format
            modal.querySelectorAll('.export-format-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const format = btn.dataset.format;
                    modal.remove();
                    resolve(format);
                });
                
                // Effet hover
                btn.addEventListener('mouseenter', () => {
                    btn.style.transform = 'translateX(4px)';
                    btn.style.borderColor = 'var(--primary-color)';
                });
                btn.addEventListener('mouseleave', () => {
                    btn.style.transform = 'translateX(0)';
                    btn.style.borderColor = 'var(--border-color)';
                });
            });
            
            // Fermeture avec Escape
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    closeModal();
                    document.removeEventListener('keydown', handleEscape);
                }
            };
            document.addEventListener('keydown', handleEscape);
        });
    }
    
    /**
     * Importe des tâches (JSON uniquement)
     */
    async importTasks() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const importedTasks = this.storageService.importData(event.target.result);
                    
                    const confirmed = await this.uiManager.confirm(
                        `Importer ${importedTasks.length} tâche${importedTasks.length > 1 ? 's' : ''} ? Cela remplacera vos données actuelles.`,
                        'Confirmer l\'import'
                    );
                    
                    if (confirmed) {
                        this.tasks = importedTasks;
                        this.saveTasks();
                        this.refreshUI();
                        this.notificationService.success('Import réussi');
                    }
                } catch (error) {
                    this.notificationService.error(error.message);
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }
}