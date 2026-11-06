import { AuthService } from '../services/auth';

export class Login {
    private auth: AuthService;

    constructor(auth: AuthService) {
        this.auth = auth;
    }

    render(): HTMLElement {
        const container = document.createElement('div');
        container.className = 'login-container';
        container.innerHTML = `
            <div class="login-box">
                <h2>🔐 Connexion</h2>
                <form id="login-form">
                    <input type="password" id="password" placeholder="Mot de passe" required>
                    <button type="submit">Se connecter</button>
                </form>
                <div id="login-error" class="error" style="display:none;"></div>
            </div>
        `;

        const form = container.querySelector('#login-form') as HTMLFormElement;
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = (container.querySelector('#password') as HTMLInputElement).value;
            const success = await this.auth.login(password);
            
            if (success) {
                window.location.reload();
            } else {
                const errorEl = container.querySelector('#login-error') as HTMLElement;
                errorEl.textContent = 'Mot de passe incorrect';
                errorEl.style.display = 'block';
            }
        });

        return container;
    }
}
