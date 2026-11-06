# Expert Auto Pro Unifié

Application Android de diagnostic automobile et expertise juridique avec IA locale.

## 🎯 Fonctionnalités

### Module Diagnostic
- Base de données massive de pannes (DTC, symptômes, solutions)
- Recherche intelligente multi-critères
- Analyse IA locale (WebGPU, 0 consommation de données)
- Multi-IA gratuit (15+ providers sans clé API)

### Module Juridique
- Analyse croisée technique + juridique
- Base massive d'articles de loi et jurisprudence
- Génération automatique de rapports d'expertise
- Gestion des dossiers hors-ligne

### Module Atelier
- Gestion des véhicules et clients
- Suivi des interventions
- Export PDF, ZIP et partage
- Console ELM327 / OBD2

### Mode Admin
- Mot de passe: `Kevin83600`
- Contrôle d'accès tiers par notifications
- Mises à jour automatiques tous les 15 jours
- Statistiques et monitoring

## 🏗️ Architecture

- **Frontend**: TypeScript + Vite
- **Mobile**: Capacitor 5
- **Base de données**: Dexie.js (IndexedDB)
- **IA**: WebLLM (local) + HuggingFace Inference (cloud)
- **Notifications**: Capacitor Local Notifications

## 🚀 Installation

### Prérequis
- Node.js 18+
- Android Studio
- JDK 17

### Développement
```bash
npm install
npm run dev
