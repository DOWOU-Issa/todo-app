import { Formatters } from '../utils/formatters.js';

/**
 * Service d'export multi-formats
 */
export class ExportService {
    constructor() {
        this.formats = {
            json: this.exportToJSON.bind(this),
            csv: this.exportToCSV.bind(this),
            txt: this.exportToTXT.bind(this),
            html: this.exportToHTML.bind(this),
            pdf: this.exportToPDF.bind(this)
        };
    }
    
    /**
     * Exporte les tâches dans le format choisi
     */
    async exportTasks(tasks, format = 'json', options = {}) {
        const exporter = this.formats[format];
        if (!exporter) {
            throw new Error(`Format non supporté: ${format}`);
        }
        
        const data = await exporter(tasks, options);
        
        // Déterminer le type MIME et l'extension
        const mimeTypes = {
            json: 'application/json',
            csv: 'text/csv;charset=utf-8;',
            txt: 'text/plain;charset=utf-8',
            html: 'text/html;charset=utf-8',
            pdf: 'application/pdf'
        };
        
        const extensions = {
            json: 'json',
            csv: 'csv',
            txt: 'txt',
            html: 'html',
            pdf: 'pdf'
        };
        
        this.downloadFile(data, `todo_export_${Date.now()}.${extensions[format]}`, mimeTypes[format]);
        
        return data;
    }
    
    /**
     * Exporte en JSON
     */
    exportToJSON(tasks, options = {}) {
        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            totalTasks: tasks.length,
            completedTasks: tasks.filter(t => t.completed).length,
            tasks: tasks.map(t => t.toJSON())
        };
        
        return JSON.stringify(exportData, null, options.pretty ? 2 : 0);
    }
    
    /**
     * Exporte en CSV - CORRIGÉ pour Excel
     */
    exportToCSV(tasks, options = {}) {
        // Séparateur point-virgule pour Excel français
        const separator = ';';
        const encoding = '\uFEFF'; // BOM pour UTF-8 avec Excel
        
        const headers = [
            'ID',
            'Titre',
            'Description',
            'Statut',
            'Priorité',
            'Catégorie',
            'Date échéance',
            'Créé le',
            'Terminé le',
            'Sous-tâches'
        ];
        
        const rows = tasks.map(task => {
            // Formater les dates correctement
            const dueDate = task.dueDate ? this.formatDateForCSV(new Date(task.dueDate)) : '';
            const createdAt = this.formatDateForCSV(new Date(task.createdAt));
            const completedAt = task.completedAt ? this.formatDateForCSV(new Date(task.completedAt)) : '';
            
            // Compter les sous-tâches
            const subtasksCount = task.subtasks ? task.subtasks.length : 0;
            const subtasksCompleted = task.subtasks ? task.subtasks.filter(st => st.completed).length : 0;
            const subtasksInfo = subtasksCount > 0 ? `${subtasksCompleted}/${subtasksCount}` : '';
            
            return [
                this.escapeCSV(task.id),
                this.escapeCSV(task.title),
                this.escapeCSV(task.description || ''),
                task.completed ? 'Terminée' : 'Active',
                this.getPriorityLabel(task.priority),
                this.getCategoryLabel(task.category),
                dueDate,
                createdAt,
                completedAt,
                subtasksInfo
            ].join(separator);
        });
        
        // Ajouter le BOM et le séparateur
        const csvContent = encoding + [
            headers.join(separator),
            ...rows
        ].join('\n');
        
        return csvContent;
    }
    
    /**
     * Formate une date pour CSV (format Excel compatible)
     */
    formatDateForCSV(date) {
        if (!date || isNaN(date.getTime())) return '';
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    }
    
    /**
     * Exporte en TXT
     */
    exportToTXT(tasks, options = {}) {
        const separator = '='.repeat(60);
        const lines = [
            separator,
            `Rapport des tâches - ${new Date().toLocaleString()}`,
            separator,
            '',
            `Total: ${tasks.length} tâches`,
            `Terminées: ${tasks.filter(t => t.completed).length}`,
            `Actives: ${tasks.filter(t => !t.completed).length}`,
            '',
            '-'.repeat(60),
            ''
        ];
        
        tasks.forEach((task, index) => {
            lines.push(`${index + 1}. ${task.completed ? '[✓]' : '[ ]'} ${task.title}`);
            if (task.description) {
                lines.push(`   Description: ${task.description}`);
            }
            lines.push(`   Priorité: ${this.getPriorityLabel(task.priority)}`);
            lines.push(`   Catégorie: ${this.getCategoryLabel(task.category)}`);
            if (task.dueDate) {
                lines.push(`   Échéance: ${new Date(task.dueDate).toLocaleString()}`);
            }
            lines.push(`   Créée: ${new Date(task.createdAt).toLocaleString()}`);
            if (task.subtasks && task.subtasks.length > 0) {
                lines.push(`   Sous-tâches: ${task.subtasks.filter(st => st.completed).length}/${task.subtasks.length}`);
            }
            lines.push('');
        });
        
        return lines.join('\n');
    }
    
    /**
     * Exporte en HTML
     */
    exportToHTML(tasks, options = {}) {
        const completed = tasks.filter(t => t.completed);
        const active = tasks.filter(t => !t.completed);
        
        return `<!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Export des tâches</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: 'Segoe UI', Arial, sans-serif;
                        margin: 40px;
                        background: #f5f5f5;
                    }
                    .container {
                        max-width: 900px;
                        margin: 0 auto;
                        background: white;
                        padding: 30px;
                        border-radius: 12px;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    }
                    h1 { color: #6366f1; border-bottom: 3px solid #6366f1; padding-bottom: 10px; margin-bottom: 20px; }
                    .stats { display: flex; gap: 20px; margin: 20px 0; flex-wrap: wrap; }
                    .stat-card {
                        flex: 1;
                        background: #f9fafb;
                        padding: 15px;
                        border-radius: 8px;
                        text-align: center;
                        border: 1px solid #e5e7eb;
                    }
                    .stat-number { font-size: 28px; font-weight: bold; color: #6366f1; }
                    .stat-label { font-size: 14px; color: #6b7280; margin-top: 5px; }
                    .section-title { margin: 25px 0 15px 0; color: #374151; }
                    .task-item {
                        border: 1px solid #e5e7eb;
                        margin: 10px 0;
                        padding: 15px;
                        border-radius: 8px;
                        transition: box-shadow 0.2s;
                    }
                    .task-item:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                    .task-item.completed { background: #f9fafb; opacity: 0.8; }
                    .task-title { font-size: 16px; font-weight: 600; margin-bottom: 8px; color: #111827; }
                    .task-description { font-size: 14px; color: #6b7280; margin: 8px 0; }
                    .task-meta { font-size: 12px; color: #9ca3af; margin-top: 8px; display: flex; flex-wrap: wrap; gap: 12px; }
                    .badge {
                        display: inline-block;
                        padding: 2px 10px;
                        border-radius: 20px;
                        font-size: 11px;
                        font-weight: 500;
                    }
                    .priority-high { background: #fee2e2; color: #dc2626; }
                    .priority-medium { background: #fed7aa; color: #ea580c; }
                    .priority-low { background: #d1fae5; color: #059669; }
                    .category-badge { background: #e0e7ff; color: #4f46e5; }
                    footer { margin-top: 30px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>📋 To-Do List Pro - Rapport des tâches</h1>
                    <p>Exporté le ${new Date().toLocaleString('fr-FR')}</p>
                    
                    <div class="stats">
                        <div class="stat-card">
                            <div class="stat-number">${tasks.length}</div>
                            <div class="stat-label">Total des tâches</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${active.length}</div>
                            <div class="stat-label">Tâches actives</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${completed.length}</div>
                            <div class="stat-label">Tâches terminées</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${tasks.length ? Math.round((completed.length / tasks.length) * 100) : 0}%</div>
                            <div class="stat-label">Taux de complétion</div>
                        </div>
                    </div>
                    
                    <h2 class="section-title">📌 Tâches actives</h2>
                    ${active.length > 0 ? active.map(task => this.taskToHTML(task)).join('') : '<p style="color: #9ca3af; text-align: center;">Aucune tâche active</p>'}
                    
                    <h2 class="section-title">✅ Tâches terminées</h2>
                    ${completed.length > 0 ? completed.map(task => this.taskToHTML(task, true)).join('') : '<p style="color: #9ca3af; text-align: center;">Aucune tâche terminée</p>'}
                    
                    <footer>
                        <p>Généré par To-Do List Pro - Application de gestion de tâches</p>
                    </footer>
                </div>
            </body>
            </html>`;
    }
    
    /**
     * Exporte en PDF - CORRIGÉ
     */
    async exportToPDF(tasks, options = {}) {
        // Vérifier si jsPDF est disponible, sinon le charger
        if (typeof window.jspdf === 'undefined') {
            await this.loadJSDPF();
        }
        
        const { jsPDF } = window.jspdf;
        
        // Créer un document PDF en format A4
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        let y = 20;
        const pageHeight = 277; // Hauteur A4 en mm
        const margin = 20;
        
        // Titre
        doc.setFontSize(20);
        doc.setTextColor(99, 102, 241);
        doc.text('To-Do List Pro - Rapport des tâches', margin, y);
        y += 10;
        
        // Date
        doc.setFontSize(10);
        doc.setTextColor(107, 114, 128);
        doc.text(`Exporté le ${new Date().toLocaleString('fr-FR')}`, margin, y);
        y += 15;
        
        // Statistiques
        const completedCount = tasks.filter(t => t.completed).length;
        const activeCount = tasks.length - completedCount;
        const completionRate = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`📊 Statistiques`, margin, y);
        y += 8;
        
        doc.setFontSize(10);
        doc.text(`Total: ${tasks.length} tâches`, margin + 5, y);
        y += 6;
        doc.text(`Actives: ${activeCount} tâches`, margin + 5, y);
        y += 6;
        doc.text(`Terminées: ${completedCount} tâches`, margin + 5, y);
        y += 6;
        doc.text(`Taux de complétion: ${completionRate}%`, margin + 5, y);
        y += 12;
        
        // Liste des tâches
        doc.setFontSize(12);
        doc.text(`📋 Liste des tâches`, margin, y);
        y += 8;
        
        // Trier les tâches (actives d'abord)
        const sortedTasks = [...tasks].sort((a, b) => {
            if (a.completed === b.completed) return 0;
            return a.completed ? 1 : -1;
        });
        
        for (const task of sortedTasks) {
            // Vérifier l'espace sur la page
            if (y > pageHeight - 40) {
                doc.addPage();
                y = 20;
            }
            
            const status = task.completed ? '✓' : '○';
            doc.setFontSize(10);
            doc.setTextColor(task.completed ? 107 : 0, 107, 114, 128);
            doc.text(`${status} ${this.truncateText(task.title, 70)}`, margin + 2, y);
            y += 6;
            
            // Description (si présente)
            if (task.description) {
                const descLines = doc.splitTextToSize(`  ${this.truncateText(task.description, 100)}`, 170);
                doc.setFontSize(8);
                doc.setTextColor(107, 114, 128);
                descLines.forEach(line => {
                    if (y > pageHeight - 20) {
                        doc.addPage();
                        y = 20;
                    }
                    doc.text(line, margin + 4, y);
                    y += 4;
                });
            }
            
            // Métadonnées
            doc.setFontSize(8);
            doc.setTextColor(156, 163, 175);
            let metaText = `  ${this.getPriorityLabel(task.priority)} | ${this.getCategoryLabel(task.category)}`;
            if (task.dueDate) {
                metaText += ` | Échéance: ${new Date(task.dueDate).toLocaleDateString('fr-FR')}`;
            }
            metaText += ` | Créée: ${new Date(task.createdAt).toLocaleDateString('fr-FR')}`;
            
            if (y > pageHeight - 20) {
                doc.addPage();
                y = 20;
            }
            doc.text(metaText, margin + 4, y);
            y += 8;
            
            // Séparateur léger
            if (y < pageHeight - 20) {
                doc.setDrawColor(229, 231, 235);
                doc.line(margin, y - 2, 190, y - 2);
            }
        }
        
        // Pied de page
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(156, 163, 175);
            doc.text(`Page ${i} / ${pageCount}`, 180, 287, { align: 'right' });
            doc.text('Généré par To-Do List Pro', margin, 287);
        }
        
        // Retourner le PDF en data URL
        return doc.output('datauristring');
    }
    
    /**
     * Tronque un texte pour le PDF
     */
    truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    }
    
    /**
     * Convertit une tâche en HTML
     */
    taskToHTML(task, isCompleted = false) {
        const priorityClass = `priority-${task.priority}`;
        const priorityLabel = this.getPriorityLabel(task.priority);
        const categoryLabel = this.getCategoryLabel(task.category);
        
        return `
            <div class="task-item ${isCompleted ? 'completed' : ''}">
                <div class="task-title">
                    ${task.completed ? '✓' : '○'} ${this.escapeHTML(task.title)}
                </div>
                ${task.description ? `<div class="task-description">${this.escapeHTML(task.description)}</div>` : ''}
                <div class="task-meta">
                    <span class="badge ${priorityClass}">${priorityLabel}</span>
                    <span class="badge category-badge">${categoryLabel}</span>
                    ${task.dueDate ? `<span>📅 ${new Date(task.dueDate).toLocaleDateString('fr-FR')}</span>` : ''}
                    <span>🕐 Créée le ${new Date(task.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
            </div>
        `;
    }
    
    /**
     * Télécharge un fichier
     */
    downloadFile(content, filename, mimeType = 'application/octet-stream') {
        let blob;
        
        if (mimeType === 'application/pdf') {
            // Pour PDF, content est déjà une data URL
            const link = document.createElement('a');
            link.href = content;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
        }
        
        blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    /**
     * Échappe les caractères CSV
     */
    escapeCSV(str) {
        if (!str) return '';
        // Échapper les guillemets et entourer de guillemets si nécessaire
        const escaped = String(str).replace(/"/g, '""');
        if (escaped.includes(';') || escaped.includes('"') || escaped.includes('\n')) {
            return `"${escaped}"`;
        }
        return escaped;
    }
    
    /**
     * Échappe les caractères HTML
     */
    escapeHTML(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    
    /**
     * Obtient le libellé de priorité
     */
    getPriorityLabel(priority) {
        const labels = { high: 'Haute', medium: 'Moyenne', low: 'Basse' };
        return labels[priority] || 'Moyenne';
    }
    
    /**
     * Obtient le libellé de catégorie
     */
    getCategoryLabel(category) {
        const labels = {
            personal: 'Personnel',
            work: 'Travail',
            study: 'Études',
            health: 'Santé',
            other: 'Autre'
        };
        return labels[category] || 'Autre';
    }
    
    /**
     * Charge jsPDF dynamiquement
     */
    loadJSDPF() {
        return new Promise((resolve, reject) => {
            if (typeof window.jspdf !== 'undefined') {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
}