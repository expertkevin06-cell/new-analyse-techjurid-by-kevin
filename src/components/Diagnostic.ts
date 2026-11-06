import { DatabaseService } from '../services/database';
import { AILocalService } from '../services/ai-local';
import { AIMultiService } from '../services/ai-multi';

export class Diagnostic {
    private db: DatabaseService;
    private aiLocal: AILocalService;
    private aiMulti: AIMultiService;

    constructor(db: DatabaseService) {
        this.db = db;
        this.aiLocal = new AILocalService();
        this.aiMulti = new AIMultiService();
    }

    render(): HTMLElement {
        const container = document.createElement('div');
        container.className = 'diagnostic-container';
        container.innerHTML = `
            <h2>🔍 Diagnostic Automobile</h2>
            
            <div class="search-section">
                <input type="text" id="search-input" placeholder="Code panne, symptôme, composant...">
                <button id="btn-search">Rechercher</button>
            </div>

            <div class="ai-section">
                <h3>🧠 Analyse IA</h3>
                <div class="ai-mode-selector">
                    <label>
                        <input type="radio" name="ai-mode" value="local" checked> 
                        IA Locale (Sans données)
                    </label>
                    <label>
                        <input type="radio" name="ai-mode" value="multi"> 
                        Multi-IA Gratuit (15 providers)
                    </label>
                </div>
                
                <textarea id="symptom-input" placeholder="Décrivez le symptôme observé..." rows="4"></textarea>
                <input type="text" id="dtc-input" placeholder="Code DTC (optionnel, ex: P0300)">
                
                <div class="ai-controls">
                    <button id="btn-analyze-local">🔒 Analyser (Local)</button>
                    <button id="btn-analyze-multi">🌐 Analyser (Multi-IA)</button>
                </div>
                
                <div id="ai-progress" class="progress" style="display:none;">
                    <div class="progress-bar"></div>
                </div>
                
                <div id="ai-result" class="ai-result" style="display:none;">
                    <h4>📋 Résultat de l'analyse</h4>
                    <div id="ai-output"></div>
                </div>
            </div>

            <div class="results-section">
                <h3>📊 Résultats de recherche</h3>
                <div id="search-results"></div>
            </div>
        `;

        this.setupEvents(container);
        this.initAI(container);

        return container;
    }

    private async initAI(container: HTMLElement) {
        try {
            await this.aiLocal.init();
            console.log('[Diagnostic] IA locale prête');
        } catch (error) {
            console.error('[Diagnostic] Erreur init IA locale:', error);
        }
    }

    private setupEvents(container: HTMLElement) {
        const searchBtn = container.querySelector('#btn-search') as HTMLButtonElement;
        const searchInput = container.querySelector('#search-input') as HTMLInputElement;

        searchBtn.addEventListener('click', async () => {
            const query = searchInput.value.trim();
            if (query) {
                await this.performSearch(container, query);
            }
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchBtn.click();
            }
        });

        container.querySelector('#btn-analyze-local')?.addEventListener('click', () => {
            this.analyzeLocal(container);
        });

        container.querySelector('#btn-analyze-multi')?.addEventListener('click', () => {
            this.analyzeMulti(container);
        });
    }

    private async performSearch(container: HTMLElement, query: string) {
        const resultsEl = container.querySelector('#search-results') as HTMLElement;
        resultsEl.innerHTML = '<div class="loading">Recherche en cours...</div>';

        try {
            const results = await this.db.searchPannes(query);
            
            if (results.length === 0) {
                resultsEl.innerHTML = '<p class="no-results">Aucun résultat trouvé</p>';
                return;
            }

            const resultsHTML = results.map(panne => `
                <div class="panne-card ${panne.gravite}">
                    <div class="panne-header">
                        <span class="panne-code">${panne.code}</span>
                        <span class="panne-gravite">${panne.gravite.toUpperCase()}</span>
                    </div>
                    <div class="panne-body">
                        <h4>${panne.symptome}</h4>
                        <p><strong>Composant:</strong> ${panne.composant}</p>
                        <p><strong>Système:</strong> ${panne.systeme}</p>
                        ${panne.marque ? `<p><strong>Marques:</strong> ${panne.marque}</p>` : ''}
                        ${panne.solution ? `<p><strong>Solution:</strong> ${panne.solution}</p>` : ''}
                        ${panne.juridique ? `<p class="juridique"><strong>⚖️ Juridique:</strong> ${panne.juridique}</p>` : ''}
                    </div>
                </div>
            `).join('');

            resultsEl.innerHTML = resultsHTML;
        } catch (error) {
            resultsEl.innerHTML = `<p class="error">Erreur: ${error}</p>`;
        }
    }

    private async analyzeLocal(container: HTMLElement) {
        const symptom = (container.querySelector('#symptom-input') as HTMLTextAreaElement).value.trim();
        const dtc = (container.querySelector('#dtc-input') as HTMLInputElement).value.trim();

        if (!symptom) {
            alert('Veuillez décrire un symptôme');
            return;
        }

        this.showProgress(container, 'Chargement du modèle IA local...');
        
        try {
            if (!this.aiLocal.isReady()) {
                await this.aiLocal.init();
            }

            this.showProgress(container, 'Analyse en cours (0% data utilisée)...');
            
            const result = await this.aiLocal.analyze(symptom, dtc);
            
            this.hideProgress(container);
            this.showResult(container, result, 'IA Locale');
        } catch (error) {
            this.hideProgress(container);
            this.showError(container, `Erreur IA locale: ${error}`);
        }
    }

    private async analyzeMulti(container: HTMLElement) {
        const symptom = (container.querySelector('#symptom-input') as HTMLTextAreaElement).value.trim();

        if (!symptom) {
            alert('Veuillez décrire un symptôme');
            return;
        }

        this.showProgress(container, 'Interrogation des modèles gratuits...');

        try {
            const { results, consensus } = await this.aiMulti.analyzeWithConsensus(symptom);
            
            this.hideProgress(container);
            
            let output = `<h4>📊 Analyse Multi-IA (${results.length} modèles)</h4>`;
            output += `<div class="consensus"><strong>Consensus:</strong><br>${consensus}</div>`;
            
            if (results.length > 1) {
                output += '<details><summary>Voir toutes les réponses</summary>';
                results.forEach((result, index) => {
                    output += `<div class="ai-response"><strong>Modèle ${index + 1}:</strong><br>${result}</div>`;
                });
                output += '</details>';
            }

            this.showResult(container, output, 'Multi-IA');
        } catch (error) {
            this.hideProgress(container);
            this.showError(container, `Erreur Multi-IA: ${error}`);
        }
    }

    private showProgress(container: HTMLElement, message: string) {
        const progressEl = container.querySelector('#ai-progress') as HTMLElement;
        const progressBar = container.querySelector('.progress-bar') as HTMLElement;
        
        progressEl.style.display = 'block';
        progressBar.textContent = message;
        progressBar.style.width = '100%';
    }

    private hideProgress(container: HTMLElement) {
        const progressEl = container.querySelector('#ai-progress') as HTMLElement;
        progressEl.style.display = 'none';
    }

    private showResult(container: HTMLElement, content: string, source: string) {
        const resultEl = container.querySelector('#ai-result') as HTMLElement;
        const outputEl = container.querySelector('#ai-output') as HTMLElement;
        
        outputEl.innerHTML = `
            <div class="result-source">Source: ${source}</div>
            <div class="result-content">${content.replace(/\n/g, '<br>')}</div>
        `;
        resultEl.style.display = 'block';
    }

    private showError(container: HTMLElement, message: string) {
        const resultEl = container.querySelector('#ai-result') as HTMLElement;
        const outputEl = container.querySelector('#ai-output') as HTMLElement;
        
        outputEl.innerHTML = `<div class="error">${message}</div>`;
        resultEl.style.display = 'block';
    }
}
