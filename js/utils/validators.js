import { VALIDATION } from './constants.js';

/**
 * Validateurs pour les données de l'application
 */

export class Validators {
    
    /**
     * Valide le titre d'une tâche
     */
    static validateTitle(title) {
        if (!title || typeof title !== 'string') {
            return { valid: false, error: 'Le titre est requis' };
        }
        
        const trimmed = title.trim();
        
        if (trimmed.length < VALIDATION.MIN_TITLE_LENGTH) {
            return { valid: false, error: `Le titre doit contenir au moins ${VALIDATION.MIN_TITLE_LENGTH} caractère` };
        }
        
        if (trimmed.length > VALIDATION.MAX_TITLE_LENGTH) {
            return { valid: false, error: `Le titre ne peut pas dépasser ${VALIDATION.MAX_TITLE_LENGTH} caractères` };
        }
        
        return { valid: true, value: trimmed };
    }
    
    /**
     * Valide la description d'une tâche
     */
    static validateDescription(description) {
        if (!description) return { valid: true, value: '' };
        
        if (typeof description !== 'string') {
            return { valid: false, error: 'Format de description invalide' };
        }
        
        if (description.length > VALIDATION.MAX_DESCRIPTION_LENGTH) {
            return { valid: false, error: `La description ne peut pas dépasser ${VALIDATION.MAX_DESCRIPTION_LENGTH} caractères` };
        }
        
        return { valid: true, value: description.trim() };
    }
    
    /**
     * Valide la priorité
     */
    static validatePriority(priority) {
        const validPriorities = ['low', 'medium', 'high'];
        
        if (!priority || !validPriorities.includes(priority)) {
            return { valid: false, error: 'Priorité invalide' };
        }
        
        return { valid: true, value: priority };
    }
    
    /**
     * Valide la catégorie
     */
    static validateCategory(category) {
        const validCategories = ['personal', 'work', 'study', 'health', 'other'];
        
        if (!category || !validCategories.includes(category)) {
            return { valid: false, error: 'Catégorie invalide' };
        }
        
        return { valid: true, value: category };
    }
    
    /**
     * Valide la date d'échéance
     */
    static validateDueDate(dueDate) {
        if (!dueDate) return { valid: true, value: null };
        
        const date = new Date(dueDate);
        
        if (isNaN(date.getTime())) {
            return { valid: false, error: 'Date invalide' };
        }
        
        return { valid: true, value: date.toISOString() };
    }
    
    /**
     * Valide une tâche complète
     */
    static validateTask(task) {
        const titleValidation = this.validateTitle(task.title);
        if (!titleValidation.valid) return titleValidation;
        
        const descriptionValidation = this.validateDescription(task.description);
        if (!descriptionValidation.valid) return descriptionValidation;
        
        const priorityValidation = this.validatePriority(task.priority);
        if (!priorityValidation.valid) return priorityValidation;
        
        const categoryValidation = this.validateCategory(task.category);
        if (!categoryValidation.valid) return categoryValidation;
        
        const dueDateValidation = this.validateDueDate(task.dueDate);
        if (!dueDateValidation.valid) return dueDateValidation;
        
        return { valid: true };
    }
    
    /**
     * Échappe les caractères HTML pour éviter XSS
     */
    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Nettoie une chaîne de caractères
     */
    static sanitizeString(str) {
        if (!str) return '';
        return str.trim().replace(/[<>]/g, '');
    }
    
    /**
     * Valide les données importées
     */
    static validateImportedData(data) {
        if (!Array.isArray(data)) {
            return { valid: false, error: 'Les données doivent être un tableau' };
        }
        
        if (data.length > VALIDATION.MAX_TASKS) {
            return { valid: false, error: `Trop de tâches (max ${VALIDATION.MAX_TASKS})` };
        }
        
        for (let i = 0; i < data.length; i++) {
            const task = data[i];
            
            if (!task.id || !task.title) {
                return { valid: false, error: `Tâche ${i} invalide: id ou titre manquant` };
            }
            
            // Validation basique de chaque tâche
            const validation = this.validateTitle(task.title);
            if (!validation.valid) {
                return { valid: false, error: `Tâche ${i}: ${validation.error}` };
            }
        }
        
        return { valid: true };
    }
}