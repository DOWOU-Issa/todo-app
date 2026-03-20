import { Formatters } from '../utils/formatters.js';
import { PRIORITIES, CATEGORIES } from '../utils/constants.js';

/**
 * Vue pour l'affichage des tâches
 */
export class TaskView {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.onTaskToggle = null;
        this.onTaskDelete = null;
        this.onTaskEdit = null;
        this.onSubtaskToggle = null;
    }
    
    /**
     * Rend la liste des tâches
     */
    render(tasks, filter = 'all', searchTerm = '') {
        if (!this.container) return;
        
        // Appliquer les filtres
        let filteredTasks = this.filterTasks(tasks, filter);
        filteredTasks = this.searchTasks(filteredTasks, searchTerm);
        
        if (filteredTasks.length === 0) {
            this.renderEmptyState();
            return;
        }
        
        const tasksHtml = filteredTasks.map(task => this.createTaskHtml(task)).join('');
        this.container.innerHTML = tasksHtml;
        
        // Attacher les événements
        this.attachEvents();
    }
    
    /**
     * Filtre les tâches
     */
    filterTasks(tasks, filter) {
        switch (filter) {
            case 'active':
                return tasks.filter(task => !task.completed);
            case 'completed':
                return tasks.filter(task => task.completed);
            default:
                return tasks;
        }
    }
    
    /**
     * Recherche dans les tâches
     */
    searchTasks(tasks, searchTerm) {
        if (!searchTerm) return tasks;
        
        const term = searchTerm.toLowerCase();
        return tasks.filter(task => 
            task.title.toLowerCase().includes(term) ||
            (task.description && task.description.toLowerCase().includes(term)) ||
            (task.tags && task.tags.some(tag => tag.toLowerCase().includes(term)))
        );
    }
    
    /**
     * Crée le HTML d'une tâche avec design amélioré
     */
    createTaskHtml(task) {
        const priority = PRIORITIES[task.priority.toUpperCase()] || PRIORITIES.MEDIUM;
        const category = CATEGORIES[task.category.toUpperCase()] || CATEGORIES.OTHER;
        const isOverdue = task.isOverdue && task.isOverdue();
        
        // Formatage des dates
        const createdDate = Formatters.formatDate(task.createdAt);
        const dueDateHtml = task.dueDate ? `
            <div class="task-due-date ${isOverdue ? 'overdue' : ''}">
                <i class="fas fa-calendar-alt"></i>
                <span>Échéance : ${Formatters.formatDate(task.dueDate)}</span>
            </div>
        ` : '';
        
        // Sous-tâches
        const subtasksHtml = task.subtasks && task.subtasks.length > 0 ? `
            <div class="task-subtasks">
                ${task.subtasks.map(subtask => `
                    <div class="subtask-item" data-subtask-id="${subtask.id}">
                        <input 
                            type="checkbox" 
                            class="subtask-checkbox" 
                            ${subtask.completed ? 'checked' : ''}
                            data-subtask-id="${subtask.id}"
                            data-task-id="${task.id}"
                            aria-label="Sous-tâche : ${Formatters.escapeHtml(subtask.title)}"
                        >
                        <span class="${subtask.completed ? 'completed' : ''}">${Formatters.escapeHtml(subtask.title)}</span>
                    </div>
                `).join('')}
            </div>
        ` : '';
        
        // Description (si présente)
        const descriptionHtml = task.description ? `
            <p class="task-description">
                <i class="fas fa-align-left" style="margin-right: 0.5rem; opacity: 0.6;"></i>
                ${Formatters.escapeHtml(Formatters.truncate(task.description, 120))}
            </p>
        ` : '';
        
        return `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                <div class="task-main">
                    <div class="task-checkbox-container">
                        <input 
                            type="checkbox" 
                            class="task-checkbox" 
                            ${task.completed ? 'checked' : ''}
                            data-task-id="${task.id}"
                            aria-label="Marquer comme ${task.completed ? 'non terminée' : 'terminée'}"
                        >
                        
                        <div class="task-content">
                            <div class="task-title-container">
                                <h3 class="task-title ${task.completed ? 'line-through' : ''}">
                                    ${Formatters.escapeHtml(task.title)}
                                </h3>
                                <div class="task-badges">
                                    <span class="badge priority-${task.priority}" style="background: ${priority.color}20; color: ${priority.color}">
                                        ${priority.icon} ${priority.label}
                                    </span>
                                    <span class="badge category-badge" style="background: ${category.color}20; color: ${category.color}">
                                        ${category.icon} ${category.label}
                                    </span>
                                </div>
                            </div>
                            
                            ${descriptionHtml}
                            
                            <div class="task-meta">
                                <div class="task-date">
                                    <i class="fas fa-clock"></i>
                                    <span>Créée ${createdDate}</span>
                                </div>
                                ${dueDateHtml}
                                ${task.estimatedTime ? `
                                    <div class="task-time">
                                        <i class="fas fa-hourglass-half"></i>
                                        <span>${Formatters.formatDuration(task.estimatedTime)}</span>
                                    </div>
                                ` : ''}
                            </div>
                            
                            ${subtasksHtml}
                        </div>
                        
                        <div class="task-actions">
                            <button class="task-edit-btn" data-task-id="${task.id}" title="Modifier la tâche">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="task-delete-btn" data-task-id="${task.id}" title="Supprimer la tâche">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Affiche l'état vide amélioré
     */
    renderEmptyState() {
        this.container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-check-circle empty-icon"></i>
                <h3>Aucune tâche trouvée</h3>
                <p>Ajoutez votre première tâche ou modifiez vos filtres de recherche.</p>
                <button class="btn-primary" id="emptyStateAddBtn" style="margin-top: 1rem;">
                    <i class="fas fa-plus"></i>
                    Ajouter une tâche
                </button>
            </div>
        `;
        
        // Ajouter l'événement pour le bouton d'ajout
        const addBtn = document.getElementById('emptyStateAddBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                document.getElementById('taskInput')?.focus();
            });
        }
    }
    
    /**
     * Attache les événements
     */
    attachEvents() {
        // Événements pour les checkboxes
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.removeEventListener('change', this.handleToggle);
            checkbox.addEventListener('change', this.handleToggle.bind(this));
        });
        
        // Événements pour les boutons de suppression
        document.querySelectorAll('.task-delete-btn').forEach(btn => {
            btn.removeEventListener('click', this.handleDelete);
            btn.addEventListener('click', this.handleDelete.bind(this));
        });
        
        // Événements pour les boutons d'édition
        document.querySelectorAll('.task-edit-btn').forEach(btn => {
            btn.removeEventListener('click', this.handleEdit);
            btn.addEventListener('click', this.handleEdit.bind(this));
        });
        
        // Événements pour les sous-tâches
        document.querySelectorAll('.subtask-checkbox').forEach(checkbox => {
            checkbox.removeEventListener('change', this.handleSubtaskToggle);
            checkbox.addEventListener('change', this.handleSubtaskToggle.bind(this));
        });
    }
    
    /**
     * Gère le basculement d'une tâche
     */
    handleToggle(event) {
        const checkbox = event.target;
        const taskId = checkbox.dataset.taskId;
        const completed = checkbox.checked;
        
        if (this.onTaskToggle) {
            this.onTaskToggle(taskId, completed);
        }
    }
    
    /**
     * Gère la suppression d'une tâche
     */
    handleDelete(event) {
        const btn = event.currentTarget;
        const taskId = btn.dataset.taskId;
        
        if (this.onTaskDelete) {
            this.onTaskDelete(taskId);
        }
    }
    
    /**
     * Gère l'édition d'une tâche
     */
    handleEdit(event) {
        const btn = event.currentTarget;
        const taskId = btn.dataset.taskId;
        
        if (this.onTaskEdit) {
            this.onTaskEdit(taskId);
        }
    }
    
    /**
     * Gère le basculement d'une sous-tâche
     */
    handleSubtaskToggle(event) {
        const checkbox = event.target;
        const taskId = checkbox.dataset.taskId;
        const subtaskId = checkbox.dataset.subtaskId;
        const completed = checkbox.checked;
        
        if (this.onSubtaskToggle) {
            this.onSubtaskToggle(taskId, subtaskId, completed);
        }
    }
}