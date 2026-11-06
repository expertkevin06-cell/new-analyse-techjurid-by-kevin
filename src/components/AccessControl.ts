import { NotificationsService, AccessRequest } from '../services/notifications';

export class AccessControl {
    private notifications: NotificationsService;

    constructor() {
        this.notifications = new NotificationsService();
    }

    async init() {
        await this.notifications.init();
    }

    render(): HTMLElement {
        const container = document.createElement('div');
        container.className = 'access-control-container';
        container.innerHTML = `
            <h2>🔐 Contrôle d'accès tiers</h2>
            
            <div class="request-form">
                <h3>Demander l'accès</h3>
                <input type="text" id="requester-name" placeholder="Votre prénom">
                <button id="btn-request-access">Demander l'accès</button>
            </div>

            <div class="requests-list">
                <h3>📥 Demandes en attente</h3>
                <div id="pending-requests"></div>
            </div>

            <div class="all-requests">
                <h3>📜 Historique complet</h3>
                <div id="all-requests"></div>
            </div>
        `;

        this.setupEvents(container);
        this.renderRequests(container);
        
        return container;
    }

    private setupEvents(container: HTMLElement) {
        container.querySelector('#btn-request-access')?.addEventListener('click', () => {
            this.requestAccess(container);
        });
    }

    private async requestAccess(container: HTMLElement) {
        const nameInput = container.querySelector('#requester-name') as HTMLInputElement;
        const name = nameInput.value.trim();

        if (!name) {
            alert('Veuillez entrer votre prénom');
            return;
        }

        try {
            await this.notifications.requestAccess(name);
            nameInput.value = '';
            alert('Demande envoyée ! L\'administrateur recevra une notification.');
            this.renderRequests(container);
        } catch (error) {
            alert(`Erreur: ${error}`);
        }
    }

    private renderRequests(container: HTMLElement) {
        const pendingEl = container.querySelector('#pending-requests') as HTMLElement;
        const allEl = container.querySelector('#all-requests') as HTMLElement;

        const pending = this.notifications.getPendingRequests();
        const all = this.notifications.getAllRequests();

        if (pending.length === 0) {
            pendingEl.innerHTML = '<p class="empty">Aucune demande en attente</p>';
        } else {
            pendingEl.innerHTML = pending.map(req => this.renderRequestCard(req)).join('');
        }

        if (all.length === 0) {
            allEl.innerHTML = '<p class="empty">Aucun historique</p>';
        } else {
            allEl.innerHTML = all.map(req => this.renderRequestCard(req, true)).join('');
        }
    }

    private renderRequestCard(request: AccessRequest, readonly = false): string {
        const statusColors: Record<string, string> = {
            pending: '#ffa500',
            approved: '#4caf50',
            denied: '#f44336',
            revoked: '#9e9e9e'
        };

        const statusLabels: Record<string, string> = {
            pending: '⏳ En attente',
            approved: '✅ Autorisé',
            denied: '❌ Refusé',
            revoked: '🚫 Révoqué'
        };

        return `
            <div class="request-card">
                <div class="request-header">
                    <strong>${request.name}</strong>
                    <span class="status" style="color: ${statusColors[request.status]}">
                        ${statusLabels[request.status]}
                    </span>
                </div>
                <div class="request-time">
                    ${new Date(request.timestamp).toLocaleString('fr-FR')}
                </div>
            </div>
        `;
    }
}
