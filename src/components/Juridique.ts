import { DatabaseService } from '../services/database';
import { AILocalService } from '../services/ai-local';

export class Juridique {
    private db: DatabaseService;
    private aiLocal: AILocalService;

    constructor(db: DatabaseService) {
        this.db = db;
        this.aiLocal = new AILocalService();
    }

    render(): HTMLElement {
        const container = document.createElement('div');
        container.className = 'juridique-container';
        container.innerHTML = `
            <h2>⚖️ Expertise Juridique</h2>
            
            <div class="litige-form">
                <h3>📋 Contexte du litige</h3>
                
                <div class="form-group">
                    <label>Type de litige</label>
                    <select id="litige-type">
                        <option value="">-- Choisir --</option>
                        <option value="vice-cache">Vice caché</option>
                        <option value="non-conformite">Non-conformité</option>
                        <option value="garantie">Garantie constructeur</option>
                        <option value="responsabilite">Responsabilité professionnel</option>
                        <option value="vente-particulier">Vente entre particuliers</option>
                    </select>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Date de vente/intervention</label>
                        <input type="date" id="litige-date">
                    </div>
                    <div class="form-group">
                        <label>Kilométrage à la vente</label>
                        <input type="number" id="km-vente" placeholder="Ex: 85000">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Date du constat</label>
                        <input type="date" id="constat-date">
                    </div>
                    <div class="form-group">
                        <label>Kilométrage actuel</label>
                        <input type="number" id="km-actuel" placeholder="Ex: 92000">
                    </div>
                </div>

                <div class="form-group">
                    <label>Description détaillée</label>
                    <textarea id="description" rows="5" placeholder="Décrivez les pannes, symptômes, codes défaut, historique..."></textarea>
                </div>

                <div class="form-group">
                    <label>Objectif principal</label>
                    <select id="objectif">
                        <option value="">-- Choisir --</option>
                        <option value="remboursement">Remboursement total</option>
                        <option value="reparation">Prise en charge réparation</option>
                        <option value="indemnisation">Indemnisation préjudice</option>
                        <option value="annulation">Annulation de la vente</option>
                    </select>
                </div>

                <button id="btn-analyze-litige" class="btn-primary">
                    🧠 Générer le rapport d'expertise (Multi-IA)
                </button>
            </div>

            <div id="rapport-section" style="display:none;">
                <h3>📄 Rapport d'expertise</h3>
                <div class="rapport-actions">
                    <button id="btn-download-pdf">⬇️ Télécharger PDF</button>
                    <button id="btn-save-offline">💾 Sauvegarder hors-ligne</button>
                </div>
                <div id="rapport-content" class="rapport-content"></div>
            </div>

            <div class="juridique-search">
                <h3>🔍 Base juridique massive</h3>
                <input type="text" id="juridique-search" placeholder="Rechercher un article, jurisprudence...">
                <div id="juridique-results"></div>
            </div>
        `;

        this.setupEvents(container);
        return container;
    }

    private setupEvents(container: HTMLElement) {
        container.querySelector('#btn-analyze-litige')?.addEventListener('click', () => {
            this.analyzeLitige(container);
        });

        container.querySelector('#juridique-search')?.addEventListener('input', async (e) => {
            const query = (e.target as HTMLInputElement).value.trim();
            if (query.length > 2) {
                await this.searchJuridique(container, query);
            }
        });
    }

    private async analyzeLitige(container: HTMLElement) {
        const type = (container.querySelector('#litige-type') as HTMLSelectElement).value;
        const date = (container.querySelector('#litige-date') as HTMLInputElement).value;
        const kmVente = (container.querySelector('#km-vente') as HTMLInputElement).value;
        const constatDate = (container.querySelector('#constat-date') as HTMLInputElement).value;
        const kmActuel = (container.querySelector('#km-actuel') as HTMLInputElement).value;
        const description = (container.querySelector('#description') as HTMLTextAreaElement).value;
        const objectif = (container.querySelector('#objectif') as HTMLSelectElement).value;

        if (!type || !description || !objectif) {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }

        const btn = container.querySelector('#btn-analyze-litige') as HTMLButtonElement;
        btn.disabled = true;
        btn.textContent = '⚖️ Analyse juridique ultra-poussée en cours...';

        try {
            if (!this.aiLocal.isReady()) {
                await this.aiLocal.init();
            }

            const prompt = `Tu es un expert automobile et juriste spécialisé en droit de la consommation et droit automobile français.

CONTEXTE DU LITIGE:
Type: ${type}
Date de vente/intervention: ${date}
Kilométrage à la vente: ${kmVente} km
Date du constat: ${constatDate}
Kilométrage actuel: ${kmActuel} km

DESCRIPTION:
${description}

OBJECTIF DU CLIENT:
${objectif}

Fournis une analyse juridique ultra-poussée incluant:
1. Qualification juridique du litige (vices cachés art. 1641-1649 Code civil, garantie légale de conformité, responsabilité contractuelle, etc.)
2. Analyse des délais de prescription et forclusion
3. Identification des articles de loi applicables
4. Jurisprudence pertinente récente (2024-2026)
5. Évaluation des chances de succès
6. Stratégie procédurale recommandée (mise en demeure, action en justice, expertise judiciaire)
7. Calcul estimatif des dommages-intérêts potentiels
8. Modèle de courrier de mise en demeure
9. Pièces à réunir et conserver
10. Conseils pratiques pour la procédure

Réponds de manière structurée, professionnelle et détaillée.`;

            const rapport = await this.aiLocal.analyze(prompt);

            const rapportSection = container.querySelector('#rapport-section') as HTMLElement;
            const rapportContent = container.querySelector('#rapport-content') as HTMLElement;
            
            rapportContent.innerHTML = `<div class="rapport-text">${rapport.replace(/\n/g, '<br>')}</div>`;
            rapportSection.style.display = 'block';

            // Sauvegarder automatiquement
            await this.saveRapport(type, date, description, rapport);

        } catch (error) {
            alert(`Erreur lors de l'analyse: ${error}`);
        } finally {
            btn.disabled = false;
            btn.textContent = '🧠 Générer le rapport d\'expertise (Multi-IA)';
        }
    }

    private async saveRapport(type: string, date: string, description: string, rapport: string) {
        const dossier = {
            id: Date.now().toString(),
            type,
            date,
            description: description.substring(0, 200),
            rapport,
            createdAt: new Date().toISOString()
        };

        const saved = JSON.parse(localStorage.getItem('dossiers_juridiques') || '[]');
        saved.push(dossier);
        localStorage.setItem('dossiers_juridiques', JSON.stringify(saved));
    }

    private async searchJuridique(container: HTMLElement, query: string) {
        const resultsEl = container.querySelector('#juridique-results') as HTMLElement;
        
        try {
            const results = await this.db.searchJuridique(query);
            
            if (results.length === 0) {
                resultsEl.innerHTML = '<p>Aucun résultat</p>';
                return;
            }

            resultsEl.innerHTML = results.slice(0, 10).map(j => `
                <div class="juridique-card">
                    <h4>${j.type} - ${j.article}</h4>
                    <p>${j.description}</p>
                    ${j.jurisprudence ? `<p class="jurisprudence"><strong>Jurisprudence:</strong> ${j.jurisprudence}</p>` : ''}
                </div>
            `).join('');
        } catch (error) {
            resultsEl.innerHTML = `<p class="error">Erreur: ${error}</p>`;
        }
    }
}
