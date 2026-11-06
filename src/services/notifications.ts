import { LocalNotifications } from '@capacitor/local-notifications';

export interface AccessRequest {
    id: string;
    name: string;
    timestamp: number;
    status: 'pending' | 'approved' | 'denied' | 'revoked';
}

export class NotificationsService {
    private requests: AccessRequest[] = [];

    async init() {
        // Enregistrer les types d'actions
        await LocalNotifications.registerActionTypes({
            types: [{
                id: 'ACCESS_CTRL',
                actions: [
                    { id: 'approve', title: 'Autoriser' },
                    { id: 'deny', title: 'Refuser' },
                    { id: 'revoke', title: 'Révoquer' }
                ]
            }]
        });

        // Écouter les actions sur les notifications
        LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
            this.handleNotificationAction(notification);
        });
    }

    async requestAccess(name: string): Promise<void> {
        const request: AccessRequest = {
            id: Date.now().toString(),
            name,
            timestamp: Date.now(),
            status: 'pending'
        };

        this.requests.push(request);
        this.saveRequests();

        await LocalNotifications.schedule({
            notifications: [{
                title: '🔐 Demande d\'accès',
                body: `${name} demande l'accès à l'application`,
                id: parseInt(request.id),
                actionTypeId: 'ACCESS_CTRL',
                extra: { requestId: request.id }
            }]
        });
    }

    private handleNotificationAction(notification: any) {
        const action = notification.actionId;
        const requestId = notification.notification.extra?.requestId;

        if (requestId) {
            const request = this.requests.find(r => r.id === requestId);
            if (request) {
                switch (action) {
                    case 'approve':
                        request.status = 'approved';
                        break;
                    case 'deny':
                        request.status = 'denied';
                        break;
                    case 'revoke':
                        request.status = 'revoked';
                        break;
                }
                this.saveRequests();
            }
        }
    }

    getPendingRequests(): AccessRequest[] {
        return this.requests.filter(r => r.status === 'pending');
    }

    getAllRequests(): AccessRequest[] {
        return this.requests;
    }

    private saveRequests() {
        localStorage.setItem('access_requests', JSON.stringify(this.requests));
    }

    private loadRequests() {
        const stored = localStorage.getItem('access_requests');
        if (stored) {
            this.requests = JSON.parse(stored);
        }
    }
}
