import './style.css';
import { AuthService } from './services/auth';
import { DatabaseService } from './services/database';
import { UpdaterService } from './services/updater';
import { Login } from './components/Login';
import { Admin } from './components/Admin';
import { Diagnostic } from './components/Diagnostic';
import { Juridique } from './components/Juridique';
import { Atelier } from './components/Atelier';

class App {
    private auth: AuthService;
    private db: DatabaseService;
    private updater: UpdaterService;
    private currentSection: string = 'diagnostic';

    constructor() {
        this.auth = new AuthService();
        this.db = new DatabaseService();
        this.updater = new UpdaterService();
        this.init();
    }

    private async init() {
        // Initialiser la base de données
        await this.db.init();
        
        // Initialiser les mises à jour automatiques
        await this.updater.init();
        
        // Vérifier l'authentification
        await this.checkAuth();
        
        // Configurer la navigation
        this.setupNavigation();
        
        // Démarrer le monitoring réseau
        this.monitorNetwork();
    }

    private async checkAuth() {
        const isAuthenticated = await this.auth.isAuthenticated();
        if (!isAuthenticated) {
            this.showLogin();
        } else {
            this.loadSection(this.currentSection);
        }
    }

    private showLogin() {
        const content = document.getElementById('content');
        if (content) {
            content.innerHTML = '';
            const loginComponent = new Login(this.auth);
            content.appendChild(loginComponent.render());
        }
    }

    private setupNavigation() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = (e.target as HTMLElement).dataset.section;
                if (section) {
                    this.currentSection = section;
                    this.loadSection(section);
                }
            });
        });
    }

    private async loadSection(section: string) {
        const content = document.getElementById('content');
        if (!content) return;

        content.innerHTML = '<div class="loading">Chargement...</div>';

        try {
            let component;
            switch (section) {
                case 'diagnostic':
                    component = new Diagnostic(this.db);
                    break;
                case 'juridique':
                    component = new Juridique(this.db);
                    break;
                case 'atelier':
                    component = new Atelier(this.db);
                    break;
                case 'admin':
                    component = new Admin(this.auth, this.db);
                    break;
                default:
                    throw new Error('Section inconnue');
            }

            content.innerHTML = '';
            content.appendChild(component.render());
        } catch (error) {
            content.innerHTML = `<div class="error">Erreur: ${error}</div>`;
        }
    }

    private monitorNetwork() {
        const statusEl = document.getElementById('connection-status');
        
        const updateStatus = () => {
            if (navigator.onLine) {
                if (statusEl) statusEl.innerHTML = '🟢 En ligne';
            } else {
                if (statusEl) statusEl.innerHTML = '🔴 Hors ligne';
            }
        };

        window.addEventListener('online', updateStatus);
        window.addEventListener('offline', updateStatus);
        updateStatus();
    }
}

// Démarrer l'application
new App();

// Enregistrer le Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(err => {
        console.error('SW registration failed:', err);
    });
}
