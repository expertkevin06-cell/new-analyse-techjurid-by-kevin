import { BackgroundRunner } from '@capacitor/background-runner';

export class UpdaterService {
    private readonly UPDATE_INTERVAL = 15 * 24 * 60 * 60 * 1000; // 15 jours
    private readonly DATA_URL = 'https://api.github.com/repos/your-repo/releases/latest';

    async init() {
        try {
            await this.registerBackgroundTask();
            await this.checkForUpdates();
        } catch (error) {
            console.error('[Updater] Erreur init:', error);
        }
    }

    private async registerBackgroundTask() {
        await BackgroundRunner.registerTask({
            label: 'AutoUpdate15Days',
            period: this.UPDATE_INTERVAL,
            isExact: true,
            callback: async () => {
                await this.performUpdate();
            }
        });
    }

    async checkForUpdates(): Promise<boolean> {
        try {
            const response = await fetch(this.DATA_URL);
            const latest = await response.json();
            
            const currentVersion = localStorage.getItem('data_version') || '1.0.0';
            const latestVersion = latest.tag_name;

            if (this.isNewerVersion(latestVersion, currentVersion)) {
                console.log('[Updater] Nouvelle version disponible:', latestVersion);
                return true;
            }
            return false;
        } catch (error) {
            console.error('[Updater] Erreur vérification:', error);
            return false;
        }
    }

    private async performUpdate() {
        try {
            const response = await fetch(this.DATA_URL);
            const release = await response.json();
            
            // Télécharger les assets
            const assets = release.assets;
            for (const asset of assets) {
                if (asset.name.endsWith('.json')) {
                    const dataResponse = await fetch(asset.browser_download_url);
                    const data = await dataResponse.json();
                    
                    // Mettre à jour la base de données
                    await this.updateDatabase(data);
                }
            }

            // Sauvegarder la nouvelle version
            localStorage.setItem('data_version', release.tag_name);
            localStorage.setItem('last_update', Date.now().toString());

            console.log('[Updater] Mise à jour terminée');
        } catch (error) {
            console.error('[Updater] Erreur mise à jour:', error);
        }
    }

    private async updateDatabase(data: any) {
        // Implémenter la mise à jour de la base de données
        console.log('[Updater] Mise à jour de la BDD...');
    }

    private isNewerVersion(latest: string, current: string): boolean {
        const latestParts = latest.split('.').map(Number);
        const currentParts = current.split('.').map(Number);

        for (let i = 0; i < Math.max(latestParts.length, currentParts.length); i++) {
            const l = latestParts[i] || 0;
            const c = currentParts[i] || 0;
            if (l > c) return true;
            if (l < c) return false;
        }
        return false;
    }

    getLastUpdateTime(): number {
        const stored = localStorage.getItem('last_update');
        return stored ? parseInt(stored) : 0;
    }
}
