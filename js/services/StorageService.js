import { STORAGE_KEYS } from '../utils/constants.js';
import { Task } from '../models/Task.js';
import { Validators } from '../utils/validators.js';

/**
 * Service de gestion du stockage LocalStorage
 */
export class StorageService {
    constructor() {
        this.storage = window.localStorage;
        this.listeners = [];
    }
    
    /**
     * Sauvegarde les tâches
     */
    saveTasks(tasks) {
        try {
            const tasksData = tasks.map(task => task.toJSON());
            const jsonData = JSON.stringify(tasksData);
            this.storage.setItem(STORAGE_KEYS.TASKS, jsonData);
            this.notifyListeners('save', tasks);
            return true;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            if (error.name === 'QuotaExceededError') {
                throw new Error('Espace de stockage insuffisant');
            }
            return false;
        }
    }
    
    /**
     * Charge les tâches
     */
    loadTasks() {
        try {
            const data = this.storage.getItem(STORAGE_KEYS.TASKS);
            if (!data) return [];
            
            const tasksData = JSON.parse(data);
            
            // Validation des données importées
            const validation = Validators.validateImportedData(tasksData);
            if (!validation.valid) {
                console.warn('Données corrompues:', validation.error);
                return [];
            }
            
            const tasks = tasksData.map(taskData => Task.fromJSON(taskData));
            this.notifyListeners('load', tasks);
            return tasks;
        } catch (error) {
            console.error('Erreur lors du chargement:', error);
            return [];
        }
    }
    
    /**
     * Sauvegarde le thème
     */
    saveTheme(theme) {
        try {
            this.storage.setItem(STORAGE_KEYS.THEME, theme);
            return true;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde du thème:', error);
            return false;
        }
    }
    
    /**
     * Charge le thème
     */
    loadTheme() {
        try {
            return this.storage.getItem(STORAGE_KEYS.THEME) || 'light';
        } catch (error) {
            console.error('Erreur lors du chargement du thème:', error);
            return 'light';
        }
    }
    
    /**
     * Sauvegarde les paramètres
     */
    saveSettings(settings) {
        try {
            const jsonData = JSON.stringify(settings);
            this.storage.setItem(STORAGE_KEYS.SETTINGS, jsonData);
            return true;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des paramètres:', error);
            return false;
        }
    }
    
    /**
     * Charge les paramètres
     */
    loadSettings() {
        try {
            const data = this.storage.getItem(STORAGE_KEYS.SETTINGS);
            if (!data) return {};
            return JSON.parse(data);
        } catch (error) {
            console.error('Erreur lors du chargement des paramètres:', error);
            return {};
        }
    }
    
    /**
     * Crée une sauvegarde
     */
    createBackup(tasks) {
        try {
            const backup = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                tasks: tasks.map(task => task.toJSON()),
                settings: this.loadSettings()
            };
            
            const jsonData = JSON.stringify(backup);
            this.storage.setItem(STORAGE_KEYS.BACKUP, jsonData);
            return true;
        } catch (error) {
            console.error('Erreur lors de la création de la sauvegarde:', error);
            return false;
        }
    }
    
    /**
     * Restaure la sauvegarde
     */
    restoreBackup() {
        try {
            const data = this.storage.getItem(STORAGE_KEYS.BACKUP);
            if (!data) return null;
            
            const backup = JSON.parse(data);
            const tasks = backup.tasks.map(taskData => Task.fromJSON(taskData));
            
            // Restaurer les paramètres
            if (backup.settings) {
                this.saveSettings(backup.settings);
            }
            
            return tasks;
        } catch (error) {
            console.error('Erreur lors de la restauration:', error);
            return null;
        }
    }
    
    /**
     * Exporte les données au format JSON
     */
    exportData(tasks) {
        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            tasks: tasks.map(task => task.toJSON()),
            totalTasks: tasks.length,
            completedTasks: tasks.filter(t => t.completed).length
        };
        
        return JSON.stringify(exportData, null, 2);
    }
    
    /**
     * Importe les données depuis JSON
     */
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            // Vérifier le format
            if (!data.tasks || !Array.isArray(data.tasks)) {
                throw new Error('Format de données invalide');
            }
            
            // Valider les données
            const validation = Validators.validateImportedData(data.tasks);
            if (!validation.valid) {
                throw new Error(validation.error);
            }
            
            const tasks = data.tasks.map(taskData => Task.fromJSON(taskData));
            this.notifyListeners('import', tasks);
            return tasks;
        } catch (error) {
            console.error('Erreur lors de l\'import:', error);
            throw new Error('Impossible d\'importer les données: ' + error.message);
        }
    }
    
    /**
     * Efface toutes les données
     */
    clearAll() {
        try {
            this.storage.removeItem(STORAGE_KEYS.TASKS);
            this.storage.removeItem(STORAGE_KEYS.BACKUP);
            this.notifyListeners('clear', []);
            return true;
        } catch (error) {
            console.error('Erreur lors de l\'effacement:', error);
            return false;
        }
    }
    
    /**
     * Vérifie l'espace disponible
     */
    checkStorageSpace() {
        try {
            const test = 'test';
            let size = 0;
            for (let key in this.storage) {
                if (this.storage.hasOwnProperty(key)) {
                    size += (this.storage[key].length + key.length) * 2;
                }
            }
            return {
                used: size,
                available: 5 * 1024 * 1024, // 5MB typical limit
                percentage: (size / (5 * 1024 * 1024)) * 100
            };
        } catch (error) {
            return null;
        }
    }
    
    /**
     * Ajoute un listener pour les événements de stockage
     */
    addListener(callback) {
        this.listeners.push(callback);
    }
    
    /**
     * Notifie tous les listeners
     */
    notifyListeners(event, data) {
        this.listeners.forEach(listener => {
            try {
                listener(event, data);
            } catch (error) {
                console.error('Erreur dans le listener:', error);
            }
        });
    }
    
    /**
     * Synchronise avec d'autres onglets
     */
    setupSync() {
        window.addEventListener('storage', (event) => {
            if (event.key === STORAGE_KEYS.TASKS) {
                const tasks = this.loadTasks();
                this.notifyListeners('sync', tasks);
            }
        });
    }
}