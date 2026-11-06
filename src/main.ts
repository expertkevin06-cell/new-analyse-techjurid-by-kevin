import './style.css';
import { AuthService } from './services/auth';
import { DatabaseService } from './services/database';
import { UpdaterService } from './services/updater';
import { Login } from './components/Login';
import { Admin } from './components/Admin';
import { Diagnostic } from './components/Diagnostic';
import { Juridique } from './components/Juridique';
import { Atelier } from './components/Atelier';
import { AccessControl } from './components/AccessControl';

class App {
    private auth: AuthService;
    private db: DatabaseService;
    private updater: UpdaterService;
    private currentSection = 'diagnostic';

    constructor() {
        this.auth = new AuthService();
        this.db = new DatabaseService();
        this.updater = new UpdaterService();
        this.init();
    }

    private async init() {
        await this.db.init();
        await this.updater.init();
        await this.checkAuth();
        this.setupNavigation();
        this.monitorNetwork();
    }

    private async checkAuth() {
        const ok = await this.auth.isAuthenticated();
        if (!ok) this.showLogin();
        else this.loadSection(this.currentSection);
    }

    private showLogin() {
        const content = document.getElementById('content');
        if (!content) return;
        content.innerHTML = '';
        content.appendChild(new Login(this.auth).render());
    }

    private setupNavigation() {
        document.querySelectorAll('.nav-btn').forEach((btn) => {
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
            let component: { render(): HTMLElement };
            switch (section) {
                case 'diagnostic': component = new Diagnostic(this.db); break;
                case 'juridique':  component = new Juridique(this.db); break;
                case 'atelier':    component = new Atelier(this.db); break;
                case 'acces':      component = new AccessControl(); break;
                case 'admin':      component = new Admin(this.auth, this.db); break;
                default: throw new Error('Section inconnue');
            }
            content.innerHTML = '';
            content.appendChild(component.render());
        } catch (error) {
            content.innerHTML = `<div class="error">Erreur: ${error}</div>`;
        }
    }

    private monitorNetwork() {
        const el = document.getElementById('connection-status');
        const update = () => {
            if (el) el.innerHTML = navigator.onLine ? '🟢 En ligne (4G/5G/WiFi)' : '🔴 Hors ligne';
        };
        window.addEventListener('online', update);
        window.addEventListener('offline', update);
        update();
    }
}

new App();

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`)
            .catch((err) => console.error('SW registration failed:', err));
    });
}
