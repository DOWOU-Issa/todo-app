/**
 * Formateurs pour l'affichage des données
 */

export class Formatters {
    
    /**
     * Formate une date pour l'affichage
     */
    static formatDate(date, format = 'relative') {
        if (!date) return 'Pas de date';
        
        const dateObj = new Date(date);
        
        if (isNaN(dateObj.getTime())) return 'Date invalide';
        
        if (format === 'relative') {
            return this.getRelativeTime(dateObj);
        }
        
        if (format === 'full') {
            return dateObj.toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        return dateObj.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    /**
     * Calcule le temps relatif (il y a X minutes, etc.)
     */
    static getRelativeTime(date) {
        const now = new Date();
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);
        
        if (seconds < 60) return 'à l\'instant';
        if (minutes < 60) return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
        if (hours < 24) return `il y a ${hours} heure${hours > 1 ? 's' : ''}`;
        if (days < 7) return `il y a ${days} jour${days > 1 ? 's' : ''}`;
        if (weeks < 4) return `il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
        if (months < 12) return `il y a ${months} mois`;
        return `il y a ${years} an${years > 1 ? 's' : ''}`;
    }
    
    /**
     * Formate la priorité en texte avec icône
     */
    static formatPriority(priority) {
        const priorities = {
            low: { icon: '🟢', text: 'Basse' },
            medium: { icon: '🟡', text: 'Moyenne' },
            high: { icon: '🔴', text: 'Haute' }
        };
        
        const p = priorities[priority] || priorities.low;
        return `${p.icon} ${p.text}`;
    }
    
    /**
     * Formate la catégorie
     */
    static formatCategory(category) {
        const categories = {
            personal: { icon: '👤', text: 'Personnel' },
            work: { icon: '💼', text: 'Travail' },
            study: { icon: '📚', text: 'Études' },
            health: { icon: '🏥', text: 'Santé' },
            other: { icon: '📌', text: 'Autre' }
        };
        
        const c = categories[category] || categories.other;
        return `${c.icon} ${c.text}`;
    }
    
    /**
     * Formate la durée (minutes en texte lisible)
     */
    static formatDuration(minutes) {
        if (!minutes) return '';
        
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        
        if (hours === 0) return `${remainingMinutes}min`;
        if (remainingMinutes === 0) return `${hours}h`;
        return `${hours}h ${remainingMinutes}min`;
    }
    
    /**
     * Tronque un texte avec ellipsis
     */
    static truncate(text, maxLength = 100) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
    
    /**
     * Capitalise la première lettre
     */
    static capitalize(text) {
        if (!text) return '';
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }
    
    /**
     * Formate un nombre avec séparateurs de milliers
     */
    static formatNumber(number) {
        return number.toLocaleString('fr-FR');
    }
    
    /**
     * Formate un pourcentage
     */
    static formatPercentage(value, total) {
        if (total === 0) return '0%';
        const percentage = (value / total) * 100;
        return `${Math.round(percentage)}%`;
    }
    
    /**
     * Échappe les caractères HTML pour éviter XSS
     */
    static escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Échappe les caractères spéciaux pour CSV
     */
    static escapeCSV(str) {
        if (!str) return '';
        return str.replace(/"/g, '""');
    }
}

// Export par défaut pour compatibilité
export default Formatters;