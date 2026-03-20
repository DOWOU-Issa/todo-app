/**
 * Constantes globales de l'application
 */

// Clés pour le localStorage
export const STORAGE_KEYS = {
    TASKS: 'todo_app_tasks',
    THEME: 'todo_app_theme',
    SETTINGS: 'todo_app_settings',
    BACKUP: 'todo_app_backup'
};

// Priorités des tâches
export const PRIORITIES = {
    LOW: { value: 'low', label: 'Basse', icon: '🟢', color: '#10b981' },
    MEDIUM: { value: 'medium', label: 'Moyenne', icon: '🟡', color: '#f59e0b' },
    HIGH: { value: 'high', label: 'Haute', icon: '🔴', color: '#ef4444' }
};

// Catégories de tâches
export const CATEGORIES = {
    PERSONAL: { value: 'personal', label: 'Personnel', icon: '👤', color: '#8b5cf6' },
    WORK: { value: 'work', label: 'Travail', icon: '💼', color: '#3b82f6' },
    STUDY: { value: 'study', label: 'Études', icon: '📚', color: '#10b981' },
    HEALTH: { value: 'health', label: 'Santé', icon: '🏥', color: '#ef4444' },
    OTHER: { value: 'other', label: 'Autre', icon: '📌', color: '#6b7280' }
};

// Filtres disponibles
export const FILTERS = {
    ALL: 'all',
    ACTIVE: 'active',
    COMPLETED: 'completed'
};

// Types de tri
export const SORT_TYPES = {
    DATE_ASC: 'date-asc',
    DATE_DESC: 'date-desc',
    PRIORITY: 'priority',
    ALPHA_ASC: 'alpha-asc',
    ALPHA_DESC: 'alpha-desc'
};

// Messages de notification
export const NOTIFICATION_MESSAGES = {
    TASK_ADDED: '✅ Tâche ajoutée avec succès',
    TASK_UPDATED: '✏️ Tâche mise à jour',
    TASK_DELETED: '🗑️ Tâche supprimée',
    TASK_COMPLETED: '🎉 Félicitations ! Tâche terminée',
    ALL_TASKS_CLEARED: '⚠️ Toutes les tâches ont été supprimées',
    COMPLETED_TASKS_CLEARED: '🧹 Tâches terminées supprimées',
    EXPORT_SUCCESS: '📥 Export réussi',
    IMPORT_SUCCESS: '📤 Import réussi',
    ERROR_STORAGE_FULL: '❌ Espace de stockage insuffisant',
    ERROR_INVALID_DATA: '❌ Données invalides'
};

// Raccourcis clavier
export const KEYBOARD_SHORTCUTS = {
    ADD_TASK: { key: 'n', ctrl: true, action: 'addTask' },
    SEARCH: { key: 'f', ctrl: true, action: 'focusSearch' },
    TOGGLE_THEME: { key: 'd', ctrl: true, action: 'toggleTheme' },
    CLEAR_COMPLETED: { key: 'c', ctrl: true, alt: true, action: 'clearCompleted' },
    ESCAPE: { key: 'Escape', action: 'closeModal' }
};

// Configuration des animations
export const ANIMATION_CONFIG = {
    DURATION: 300,
    DEBOUNCE_DELAY: 500,
    TOAST_DURATION: 3000
};

// Limites et validations
export const VALIDATION = {
    MAX_TITLE_LENGTH: 200,
    MIN_TITLE_LENGTH: 1,
    MAX_TASKS: 1000,
    MAX_DESCRIPTION_LENGTH: 500
};

// Thèmes disponibles
export const THEMES = {
    LIGHT: 'light',
    DARK: 'dark'
};

// Format de date
export const DATE_FORMAT = {
    DISPLAY: 'DD/MM/YYYY HH:mm',
    STORAGE: 'YYYY-MM-DDTHH:mm:ss.SSSZ'
};