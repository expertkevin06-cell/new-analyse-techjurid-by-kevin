import { AuthService } from '../services/auth';
import { DatabaseService } from '../services/database';

export class Admin {
    private auth: AuthService;
    private db: DatabaseService;

    constructor(auth: AuthService, db: DatabaseService) {
        this.auth = auth;
        this.db = db;
    }

    render(): HTMLElement {
        const container = document.createElement('div');
        container.className = 'admin-container';
        container.innerHTML = `
            <h2>🛡️ Administration</h2>
            
            <div class="admin-section">
                <h3>📊 Statistiques</h3>
                <div id="stats">Chargement...</div>
            </div>

            <div class="admin-section">
                <h3>🔄 Mises à jour</h3>
                <p>Dernière MAJ: <span id="last-update">Jamais</span></p>
                <button id="btn-force-update">Forcer la mise à jour</button>
            </div>

            <div class="admin-section">
                <h3>🔐 Sécurité</h3>
                <button id="btn-logout">Déconnexion</button>
            </div>
        `;

        this.loadStats(container);
        this.setupActions(container);

        return container;
    }

    private async loadStats(container: HTMLElement) {
        const stats = await this.db.getStatistics();
        const statsEl = container.querySelector('#stats') as HTMLElement;
        statsEl.innerHTML = `
            <p>Pannes en base: <strong>${stats.pannesCount}</strong></p>
            <p>Références juridiques: <strong>${stats.juridiqueCount}</strong></p>
        `;
    }

    private setupActions(container: HTMLElement) {
        container.querySelector('#btn-logout')?.addEventListener('click', () => {
            this.auth.logout();
            window.location.reload();
        });

        container.querySelector('#btn-force-update')?.addEventListener('click', async () => {
            alert('Mise à jour lancée...');
        });
    }
}
