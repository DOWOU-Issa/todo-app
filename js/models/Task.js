import { Validators } from '../utils/validators.js';

/**
 * Modèle Task - Représente une tâche dans l'application
 */
export class Task {
    constructor(data = {}) {
        this.id = data.id || this.generateId();
        this.title = data.title || '';
        this.description = data.description || '';
        this.completed = data.completed || false;
        this.priority = data.priority || 'medium';
        this.category = data.category || 'personal';
        this.dueDate = data.dueDate || null;
        this.tags = data.tags || [];
        this.subtasks = data.subtasks || [];
        this.estimatedTime = data.estimatedTime || null;
        this.reminder = data.reminder || null;
        this.createdAt = data.createdAt || new Date().toISOString();
        this.completedAt = data.completedAt || null;
        this.updatedAt = new Date().toISOString();
        
        // Validation après initialisation
        this.validate();
    }
    
    /**
     * Génère un ID unique
     */
    generateId() {
        return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * Valide les données de la tâche
     */
    validate() {
        const titleValidation = Validators.validateTitle(this.title);
        if (!titleValidation.valid) {
            throw new Error(titleValidation.error);
        }
        
        this.title = titleValidation.value;
        
        const descValidation = Validators.validateDescription(this.description);
        if (!descValidation.valid) {
            throw new Error(descValidation.error);
        }
        
        this.description = descValidation.value;
    }
    
    /**
     * Bascule l'état complété/non complété
     */
    toggleComplete() {
        this.completed = !this.completed;
        this.completedAt = this.completed ? new Date().toISOString() : null;
        this.updatedAt = new Date().toISOString();
    }
    
    /**
     * Met à jour le titre
     */
    updateTitle(newTitle) {
        const validation = Validators.validateTitle(newTitle);
        if (!validation.valid) {
            throw new Error(validation.error);
        }
        
        this.title = validation.value;
        this.updatedAt = new Date().toISOString();
    }
    
    /**
     * Met à jour la description
     */
    updateDescription(newDescription) {
        const validation = Validators.validateDescription(newDescription);
        if (!validation.valid) {
            throw new Error(validation.error);
        }
        
        this.description = validation.value;
        this.updatedAt = new Date().toISOString();
    }
    
    /**
     * Met à jour la priorité
     */
    updatePriority(newPriority) {
        const validation = Validators.validatePriority(newPriority);
        if (!validation.valid) {
            throw new Error(validation.error);
        }
        
        this.priority = validation.value;
        this.updatedAt = new Date().toISOString();
    }
    
    /**
     * Met à jour la catégorie
     */
    updateCategory(newCategory) {
        const validation = Validators.validateCategory(newCategory);
        if (!validation.valid) {
            throw new Error(validation.error);
        }
        
        this.category = validation.value;
        this.updatedAt = new Date().toISOString();
    }
    
    /**
     * Met à jour la date d'échéance
     */
    updateDueDate(newDueDate) {
        const validation = Validators.validateDueDate(newDueDate);
        if (!validation.valid) {
            throw new Error(validation.error);
        }
        
        this.dueDate = validation.value;
        this.updatedAt = new Date().toISOString();
    }
    
    /**
     * Ajoute un tag
     */
    addTag(tag) {
        if (!this.tags.includes(tag)) {
            this.tags.push(tag);
            this.updatedAt = new Date().toISOString();
        }
    }
    
    /**
     * Supprime un tag
     */
    removeTag(tag) {
        const index = this.tags.indexOf(tag);
        if (index !== -1) {
            this.tags.splice(index, 1);
            this.updatedAt = new Date().toISOString();
        }
    }
    
    /**
     * Ajoute une sous-tâche
     */
    addSubtask(subtaskTitle) {
        const subtask = {
            id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            title: subtaskTitle,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.subtasks.push(subtask);
        this.updatedAt = new Date().toISOString();
        return subtask;
    }
    
    /**
     * Bascule l'état d'une sous-tâche
     */
    toggleSubtask(subtaskId) {
        const subtask = this.subtasks.find(st => st.id === subtaskId);
        if (subtask) {
            subtask.completed = !subtask.completed;
            this.updatedAt = new Date().toISOString();
        }
    }
    
    /**
     * Supprime une sous-tâche
     */
    removeSubtask(subtaskId) {
        const index = this.subtasks.findIndex(st => st.id === subtaskId);
        if (index !== -1) {
            this.subtasks.splice(index, 1);
            this.updatedAt = new Date().toISOString();
        }
    }
    
    /**
     * Calcule le pourcentage de complétion des sous-tâches
     */
    getSubtasksCompletion() {
        if (this.subtasks.length === 0) return 0;
        const completed = this.subtasks.filter(st => st.completed).length;
        return (completed / this.subtasks.length) * 100;
    }
    
    /**
     * Vérifie si la tâche est en retard
     */
    isOverdue() {
        if (!this.dueDate || this.completed) return false;
        return new Date(this.dueDate) < new Date();
    }
    
    /**
     * Sérialise la tâche pour le stockage
     */
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            completed: this.completed,
            priority: this.priority,
            category: this.category,
            dueDate: this.dueDate,
            tags: this.tags,
            subtasks: this.subtasks,
            estimatedTime: this.estimatedTime,
            reminder: this.reminder,
            createdAt: this.createdAt,
            completedAt: this.completedAt,
            updatedAt: this.updatedAt
        };
    }
    
    /**
     * Crée une tâche à partir de données JSON
     */
    static fromJSON(data) {
        return new Task(data);
    }
    
    /**
     * Clone la tâche
     */
    clone() {
        return new Task(this.toJSON());
    }
}