import { Sha256 } from '@aws-crypto/sha256-js';

export class AuthService {
    private static ADMIN_PASSWORD = "Kevin83600";
    private static STORAGE_KEY = 'expert_auto_auth';

    async hashPassword(password: string): Promise<string> {
        const hash = new Sha256();
        hash.update(password);
        const digest = await hash.digest();
        return Array.from(new Uint8Array(digest))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    async verifyPassword(input: string): Promise<boolean> {
        const inputHash = await this.hashPassword(input);
        const adminHash = await this.hashPassword(AuthService.ADMIN_PASSWORD);
        return inputHash === adminHash;
    }

    async login(password: string): Promise<boolean> {
        const isValid = await this.verifyPassword(password);
        if (isValid) {
            const session = {
                authenticated: true,
                timestamp: Date.now(),
                expires: Date.now() + (24 * 60 * 60 * 1000) // 24h
            };
            localStorage.setItem(AuthService.STORAGE_KEY, JSON.stringify(session));
        }
        return isValid;
    }

    async isAuthenticated(): Promise<boolean> {
        const stored = localStorage.getItem(AuthService.STORAGE_KEY);
        if (!stored) return false;

        try {
            const session = JSON.parse(stored);
            if (session.expires < Date.now()) {
                this.logout();
                return false;
            }
            return session.authenticated === true;
        } catch {
            return false;
        }
    }

    logout(): void {
        localStorage.removeItem(AuthService.STORAGE_KEY);
    }

    isAdmin(): boolean {
        // Pour l'instant, tous les utilisateurs authentifiés sont admin
        return true;
    }
}
