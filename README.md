# 📝 To-Do List Pro - Application de Gestion de Tâches

[![Version](https://img.shields.io/badge/version-2.0-blue.svg)](https://github.com/yourusername/todo-app)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/fr/docs/Web/JavaScript)
[![Accessibility](https://img.shields.io/badge/Accessibility-WCAG_2.1-green.svg)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 🎵 Musique d'ambiance

Cette application intègre une musique d'ambiance *Jazz Café* provenant de **Pixabay**, créant une atmosphère relaxante et productive pour la gestion de vos tâches quotidiennes.

---

## 📋 Table des matières

- [Présentation](#-présentation)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture](#-architecture)
- [Structure du projet](#-structure-du-projet)
- [Installation](#-installation)
- [Utilisation](#-utilisation)
- [Raccourcis clavier](#-raccourcis-clavier)
- [API et Stockage](#-api-et-stockage)
- [Accessibilité](#-accessibilité)
- [Performances](#-performances)
- [Compatibilité](#-compatibilité)
- [Export des données](#-export-des-données)
- [Crédits](#-crédits)
- [Licence](#-licence)

---

## 🎯 Présentation

**To-Do List Pro** est une application web moderne de gestion de tâches développée dans le cadre du cursus **L3 IABD (Intelligence Artificielle et Big Data)**. Elle démontre l'utilisation des technologies web modernes avec une architecture propre, maintenable et accessible.

### ✨ Points forts

| Caractéristique | Description |
|-----------------|-------------|
| 🎨 **Interface moderne** | Design épuré avec thème clair/sombre/auto |
| ♿ **Accessibilité WCAG 2.1** | Compatible lecteurs d'écran et navigation clavier |
| 💾 **Persistance des données** | Sauvegarde automatique dans LocalStorage |
| 🎵 **Musique d'ambiance** | Jazz Café (Pixabay) |
| 📱 **Responsive Design** | Adaptation à tous les écrans (mobile, tablette, desktop) |
| ⚡ **Performance optimisée** | Lighthouse score 95+ |
| 📤 **Export multi-formats** | JSON, CSV (Excel), TXT, HTML, PDF |

---

## 🚀 Fonctionnalités

### 📋 Gestion des Tâches

| Fonctionnalité | Description |
|----------------|-------------|
| ✅ **Création** | Ajout rapide avec suggestions |
| ✏️ **Modification** | Édition complète (titre, description, priorité, catégorie, échéance) |
| 🗑️ **Suppression** | Suppression individuelle ou groupée |
| 🔄 **Statut** | Marquer comme terminée avec animation |
| 📝 **Description** | Texte détaillé pour chaque tâche |
| ✓ **Sous-tâches** | Checklist intégrée |

### 🏷️ Organisation

| Fonctionnalité | Description |
|----------------|-------------|
| 🔴 **Priorités** | Haute / Moyenne / Basse avec couleurs |
| 📁 **Catégories** | Personnel, Travail, Études, Santé, Autre |
| 📅 **Échéances** | Dates limites avec rappel visuel |
| 🏷️ **Tags** | Étiquettes personnalisables |

### 🔍 Recherche & Filtres

| Fonctionnalité | Description |
|----------------|-------------|
| 🔍 **Recherche** | Temps réel sur titre et description |
| 🎯 **Filtres** | Toutes / Actives / Terminées |
| 📊 **Tri** | Date, priorité, ordre alphabétique |
| 📈 **Statistiques** | Compteurs et graphiques en temps réel |

### 💾 Sauvegarde & Export

| Fonctionnalité | Description |
|----------------|-------------|
| 💾 **Auto-sauvegarde** | Sauvegarde automatique après chaque action |
| 📤 **Export multi-formats** | JSON, CSV (Excel), TXT, HTML, PDF |
| 📥 **Import JSON** | Restauration depuis fichier |
| 🔄 **Sync multi-onglets** | Synchronisation temps réel |

### 🎨 Interface & Expérience

| Fonctionnalité | Description |
|----------------|-------------|
| 🌓 **Mode sombre/clair/auto** | Bascule avec préférence système |
| ✨ **Animations** | Transitions fluides et réactives |
| ⌨️ **Raccourcis clavier** | Navigation rapide |
| 🔔 **Notifications** | Rappels système pour échéances |
| 📱 **Responsive** | Adaptation à tous les écrans |

---

## 🏗️ Architecture

### Architecture MVC (Model-View-Controller)
┌─────────────────────────────────────────────────────────────────────────┐
│ PRESENTATION LAYER │
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ │
│ │ HTML5 │ │ CSS3 │ │ Animations │ │
│ │ Structure │ │ Styles + │ │ Transitions │ │
│ │ Sémantique │ │ Thèmes │ │ Keyframes │ │
│ └──────────────────┘ └──────────────────┘ └──────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ CONTROLLER LAYER │
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ │
│ │ TaskController │ │SettingsController│ │ UIManager │ │
│ │ - CRUD Tâches │ │ - Thème │ │ - Modals │ │
│ │ - Filtres/Tris │ │ - Notifications │ │ - Toasts │ │
│ │ - Export/Import │ │ - Sauvegarde │ │ - Loading │ │
│ └──────────────────┘ └──────────────────┘ └──────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ SERVICE LAYER │
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ │
│ │ StorageService │ │NotificationService│ │ ExportService │ │
│ │ - LocalStorage │ │ - Notifications │ │ - JSON/CSV/TXT │ │
│ │ - Backup │ │ - Toasts │ │ - HTML/PDF │ │
│ │ - Sync │ │ - Permission │ │ - Téléchargement │ │
│ └──────────────────┘ └──────────────────┘ └──────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ MODEL LAYER │
│ ┌──────────────────────────────────────────────────────────────────┐ │
│ │ Task Model │ │
│ │ - id, title, description, completed, priority, category │ │
│ │ - dueDate, subtasks, tags, createdAt, completedAt │ │
│ │ - Méthodes: toggleComplete(), updateTitle(), addSubtask() │ │
│ └──────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘

text

### Flux de Données
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ User Action│────▶│ Controller │────▶│ Model │────▶│ Storage │
│ (Click) │ │ (Logique) │ │ (Données) │ │ (Persist) │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
▲ │
│ ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ UI Update │◀────│ View │◀────│ Service │◀────│ Storage │
│ (Affichage)│ │ (Render) │ │ (Notif.) │ │ (Load) │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘

text

---

## 📁 Structure du projet
todo-app/
│
├── index.html # Page principale (accessible)
├── README.md # Documentation complète
│
├── css/ # Styles CSS
│ ├── style.css # Styles principaux
│ ├── animations.css # Animations et transitions
│ └── responsive.css # Media queries responsive
│
├── js/ # JavaScript
│ ├── app.js # Point d'entrée principal
│ │
│ ├── utils/ # Utilitaires
│ │ ├── constants.js # Constantes globales
│ │ ├── validators.js # Validation des données
│ │ ├── formatters.js # Formatage (dates, texte)
│ │ └── debounce.js # Optimisation performances
│ │
│ ├── models/ # Modèles de données
│ │ └── Task.js # Modèle Task (CRUD)
│ │
│ ├── services/ # Services externes
│ │ ├── StorageService.js # Gestion LocalStorage
│ │ ├── NotificationService.js # Notifications système
│ │ └── ExportService.js # Export multi-formats
│ │
│ ├── views/ # Vues (rendu UI)
│ │ ├── TaskView.js # Affichage des tâches
│ │ ├── UIManager.js # Gestion interface globale
│ │ └── StatsView.js # Statistiques avancées
│ │
│ └── controllers/ # Logique métier
│ ├── TaskController.js # CRUD et gestion des tâches
│ └── SettingsController.js # Paramètres utilisateur
│
├── assets/ # Ressources multimédia
│ ├── icons/ # Icônes SVG
│ │ ├── check.svg
│ │ ├── delete.svg
│ │ ├── edit.svg
│ │ ├── category.svg
│ │ └── priority.svg
│ │
│ └── sounds/ # Effets sonores
│ ├── complete.mp3 # Son tâche terminée
│ ├── add.mp3 # Son ajout tâche
│ ├── delete.mp3 # Son suppression
│ └── notification.mp3 # Son notification
│
└── tests/ # Tests unitaires (optionnel)
└── ...

text

---

## 💻 Installation

### Prérequis
- Navigateur moderne (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- JavaScript activé
- Connexion internet (pour les polices et icônes CDN)

### Installation locale

```bash
# Cloner le dépôt
git clone https://github.com/yourusername/todo-app.git

# Accéder au dossier
cd todo-app

# Lancer avec un serveur local (optionnel)
python -m http.server 8000
# ou
npx serve
# ou
php -S localhost:8000
Dépendances
Aucune dépendance npm requise ! L'application utilise uniquement des CDN :


 Roadmap
Version 2.1 (Prévue)
Synchronisation cloud (Firebase)

Application mobile (PWA)

IA pour suggestions intelligentes

Intégration Google Calendar

Version 2.2
Thèmes personnalisables

Widgets dashboard

Export PDF amélioré

👨‍💻 Auteur
Développeur : DOWOU Issa
Formation : L3 IABD - Intelligence Artificielle et Big Data
Établissement : College de Paris Superieure
GitHub : https://github.com/DOWOU-Issa

🙏 Remerciements
IUT Lyon 1 - Département IABD

Pixabay - Musique Jazz Café

Font Awesome - Icônes open source

Google Fonts - Typographie Inter

Communauté open source

 Licence
Ce projet est sous licence MIT.

text
MIT License

Copyright (c) 2026 DOWOU Issa

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.