import { Formatters } from '../utils/formatters.js';
import { PRIORITIES, CATEGORIES } from '../utils/constants.js';

/**
 * Vue des statistiques avancées
 */
export class StatsView {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.charts = {};
    }
    
    /**
     * Affiche les statistiques complètes
     */
    render(tasks) {
        if (!this.container) return;
        
        const stats = this.calculateStats(tasks);
        
        this.container.innerHTML = `
            <div class="stats-dashboard">
                <!-- Cartes principales -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">📊</div>
                        <div class="stat-info">
                            <div class="stat-value">${stats.completionRate}%</div>
                            <div class="stat-label">Taux de complétion</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">⚡</div>
                        <div class="stat-info">
                            <div class="stat-value">${stats.productivityScore}</div>
                            <div class="stat-label">Score productivité</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">📅</div>
                        <div class="stat-info">
                            <div class="stat-value">${stats.avgCompletionTime}</div>
                            <div class="stat-label">Temps moyen</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">🎯</div>
                        <div class="stat-info">
                            <div class="stat-value">${stats.todayTasks}</div>
                            <div class="stat-label">Tâches aujourd'hui</div>
                        </div>
                    </div>
                </div>
                
                <!-- Graphiques -->
                <div class="stats-charts">
                    <div class="chart-container">
                        <h4>📊 Par priorité</h4>
                        <canvas id="priorityChart" width="300" height="200"></canvas>
                    </div>
                    <div class="chart-container">
                        <h4>🏷️ Par catégorie</h4>
                        <canvas id="categoryChart" width="300" height="200"></canvas>
                    </div>
                    <div class="chart-container">
                        <h4>📈 Progression 7 jours</h4>
                        <canvas id="trendChart" width="300" height="200"></canvas>
                    </div>
                </div>
                
                <!-- Détails -->
                <div class="stats-details">
                    <div class="detail-section">
                        <h4>🏆 Meilleure journée</h4>
                        <p>${stats.bestDay || 'Aucune donnée'}</p>
                    </div>
                    <div class="detail-section">
                        <h4>📈 Moyenne quotidienne</h4>
                        <p>${stats.dailyAverage} tâche(s)/jour</p>
                    </div>
                    <div class="detail-section">
                        <h4>⏰ Heure de pointe</h4>
                        <p>${stats.peakHour || 'Non déterminée'}</p>
                    </div>
                    <div class="detail-section">
                        <h4>🎯 Objectif semaine</h4>
                        <div class="goal-progress">
                            <div class="goal-bar" style="width: ${stats.weeklyGoalProgress}%"></div>
                            <span>${stats.completedThisWeek} / ${stats.weeklyGoal} tâches</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Créer les graphiques après l'insertion dans le DOM
        setTimeout(() => {
            this.createPriorityChart(stats.priorityDistribution);
            this.createCategoryChart(stats.categoryDistribution);
            this.createTrendChart(stats.dailyTrend);
        }, 100);
    }
    
    /**
     * Calcule les statistiques
     */
    calculateStats(tasks) {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const active = total - completed;
        const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);
        
        // Distribution par priorité
        const priorityDistribution = {
            high: tasks.filter(t => t.priority === 'high').length,
            medium: tasks.filter(t => t.priority === 'medium').length,
            low: tasks.filter(t => t.priority === 'low').length
        };
        
        // Distribution par catégorie
        const categoryDistribution = {
            personal: tasks.filter(t => t.category === 'personal').length,
            work: tasks.filter(t => t.category === 'work').length,
            study: tasks.filter(t => t.category === 'study').length,
            health: tasks.filter(t => t.category === 'health').length,
            other: tasks.filter(t => t.category === 'other').length
        };
        
        // Temps moyen de complétion
        const completedTasks = tasks.filter(t => t.completed && t.completedAt);
        let avgCompletionTime = 'N/A';
        if (completedTasks.length > 0) {
            const totalTime = completedTasks.reduce((sum, task) => {
                const created = new Date(task.createdAt);
                const completedDate = new Date(task.completedAt);
                return sum + (completedDate - created);
            }, 0);
            const avgHours = totalTime / completedTasks.length / (1000 * 60 * 60);
            if (avgHours < 1) {
                const avgMinutes = Math.round(avgHours * 60);
                avgCompletionTime = `${avgMinutes} min`;
            } else {
                avgCompletionTime = `${Math.round(avgHours)}h`;
            }
        }
        
        // Tâches d'aujourd'hui
        const today = new Date().toDateString();
        const todayTasks = tasks.filter(t => {
            const dueDate = t.dueDate ? new Date(t.dueDate).toDateString() : null;
            return dueDate === today;
        }).length;
        
        // Score de productivité
        const productivityScore = this.calculateProductivityScore(tasks);
        
        // Tendance 7 jours
        const dailyTrend = this.getDailyTrend(tasks, 7);
        
        // Meilleure journée
        const bestDay = this.getBestDay(tasks);
        
        // Moyenne quotidienne
        const dailyAverage = this.getDailyAverage(tasks);
        
        // Heure de pointe
        const peakHour = this.getPeakHour(tasks);
        
        // Objectif hebdomadaire (10 tâches par défaut)
        const weeklyGoal = 10;
        const completedThisWeek = tasks.filter(t => {
            if (!t.completed || !t.completedAt) return false;
            const completedDate = new Date(t.completedAt);
            const now = new Date();
            const weekAgo = new Date(now.setDate(now.getDate() - 7));
            return completedDate >= weekAgo;
        }).length;
        const weeklyGoalProgress = Math.min(100, (completedThisWeek / weeklyGoal) * 100);
        
        return {
            total,
            completed,
            active,
            completionRate,
            priorityDistribution,
            categoryDistribution,
            avgCompletionTime,
            todayTasks,
            productivityScore,
            dailyTrend,
            bestDay,
            dailyAverage,
            peakHour,
            weeklyGoal,
            completedThisWeek,
            weeklyGoalProgress
        };
    }
    
    /**
     * Calcule le score de productivité
     */
    calculateProductivityScore(tasks) {
        if (tasks.length === 0) return 0;
        
        const completed = tasks.filter(t => t.completed).length;
        const completionRate = (completed / tasks.length) * 100;
        
        // Bonus pour les tâches à haute priorité
        const highPriorityCompleted = tasks.filter(t => t.completed && t.priority === 'high').length;
        const highPriorityBonus = (highPriorityCompleted / Math.max(1, tasks.filter(t => t.priority === 'high').length)) * 20;
        
        // Malus pour les tâches en retard
        const overdue = tasks.filter(t => !t.completed && t.isOverdue && t.isOverdue()).length;
        const overdueMalus = (overdue / tasks.length) * 30;
        
        let score = (completionRate * 0.7) + (highPriorityBonus * 0.3) - overdueMalus;
        return Math.max(0, Math.min(100, Math.round(score)));
    }
    
    /**
     * Obtient la tendance quotidienne
     */
    getDailyTrend(tasks, days) {
        const trend = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('fr-FR', { weekday: 'short' });
            
            const completed = tasks.filter(t => {
                if (!t.completed || !t.completedAt) return false;
                const completedDate = new Date(t.completedAt).toDateString();
                return completedDate === date.toDateString();
            }).length;
            
            trend.push({ date: dateStr, count: completed });
        }
        return trend;
    }
    
    /**
     * Obtient la meilleure journée
     */
    getBestDay(tasks) {
        const dayCounts = {};
        const dayNames = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
        
        tasks.forEach(task => {
            if (task.completed && task.completedAt) {
                const dayIndex = new Date(task.completedAt).getDay();
                const dayName = dayNames[dayIndex];
                dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
            }
        });
        
        let bestDay = null;
        let maxCount = 0;
        for (const [day, count] of Object.entries(dayCounts)) {
            if (count > maxCount) {
                maxCount = count;
                bestDay = day;
            }
        }
        
        return bestDay ? `${bestDay} (${maxCount} tâche${maxCount > 1 ? 's' : ''})` : null;
    }
    
    /**
     * Obtient la moyenne quotidienne
     */
    getDailyAverage(tasks) {
        if (tasks.length === 0) return 0;
        
        const firstTask = new Date(Math.min(...tasks.map(t => new Date(t.createdAt).getTime())));
        const daysSince = Math.max(1, Math.ceil((new Date() - firstTask) / (1000 * 60 * 60 * 24)));
        
        return Math.round((tasks.length / daysSince) * 10) / 10;
    }
    
    /**
     * Obtient l'heure de pointe
     */
    getPeakHour(tasks) {
        const hourCounts = {};
        tasks.forEach(task => {
            if (task.completed && task.completedAt) {
                const hour = new Date(task.completedAt).getHours();
                hourCounts[hour] = (hourCounts[hour] || 0) + 1;
            }
        });
        
        let peakHour = null;
        let maxCount = 0;
        for (const [hour, count] of Object.entries(hourCounts)) {
            if (count > maxCount) {
                maxCount = count;
                peakHour = hour;
            }
        }
        
        return peakHour ? `${peakHour}h - ${parseInt(peakHour) + 1}h` : null;
    }
    
    /**
     * Crée le graphique des priorités
     */
    createPriorityChart(distribution) {
        const canvas = document.getElementById('priorityChart');
        if (!canvas) return;
        
        // Vérifier si Chart.js est chargé
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not loaded');
            return;
        }
        
        // Détruire le graphique existant
        if (this.charts.priority) {
            this.charts.priority.destroy();
        }
        
        this.charts.priority = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: ['Haute', 'Moyenne', 'Basse'],
                datasets: [{
                    data: [distribution.high, distribution.medium, distribution.low],
                    backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { 
                        position: 'bottom',
                        labels: { font: { size: 11 } }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Crée le graphique des catégories
     */
    createCategoryChart(distribution) {
        const canvas = document.getElementById('categoryChart');
        if (!canvas) return;
        
        if (typeof Chart === 'undefined') return;
        
        if (this.charts.category) {
            this.charts.category.destroy();
        }
        
        this.charts.category = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: ['Perso', 'Travail', 'Études', 'Santé', 'Autre'],
                datasets: [{
                    data: [
                        distribution.personal,
                        distribution.work,
                        distribution.study,
                        distribution.health,
                        distribution.other
                    ],
                    backgroundColor: '#6366f1',
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.raw} tâche(s)`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    }
                }
            }
        });
    }
    
    /**
     * Crée le graphique de tendance
     */
    createTrendChart(trend) {
        const canvas = document.getElementById('trendChart');
        if (!canvas) return;
        
        if (typeof Chart === 'undefined') return;
        
        if (this.charts.trend) {
            this.charts.trend.destroy();
        }
        
        this.charts.trend = new Chart(canvas, {
            type: 'line',
            data: {
                labels: trend.map(t => t.date),
                datasets: [{
                    data: trend.map(t => t.count),
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#6366f1',
                    pointBorderColor: '#fff',
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.raw} tâche(s) complétée(s)`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1, precision: 0 }
                    }
                }
            }
        });
    }
}