import { DatabaseService } from '../services/database';

export interface Vehicule {
    id?: number;
    immatriculation: string;
    vin: string;
    marque: string;
    modele: string;
    motorisation: string;
    annee: number;
    kilometrage: number;
    client: string;
    telephone: string;
    notes: string;
    createdAt: string;
}

export interface Intervention {
    id?: number;
    vehiculeId: number;
    intitule: string;
    diagnostic: string;
    pieces: string;
    mainOeuvre: string;
    cout: number;
    technicien: string;
    date: string;
    synchronized: boolean;
}

export class Atelier {
    private db: DatabaseService;
    private vehicules: Vehicule[] = [];
    private interventions: Intervention[] = [];

    constructor(db: DatabaseService) {
        this.db = db;
    }

    render(): HTMLElement {
        const container = document.createElement('div');
        container.className = 'atelier-container';
        container.innerHTML = `
            <h2>🧰 Atelier & Gestion</h2>
            
            <div class="tabs">
                <button class="tab-btn active" data-tab="vehicules">🚘 Véhicules</button>
                <button class="tab-btn" data-tab="interventions">🛠️ Interventions</button>
                <button class="tab-btn" data-tab="historique">📚 Historique</button>
                <button class="tab-btn" data-tab="export">📤 Export</button>
            </div>

            <div id="tab-content">
                <div id="vehicules-tab" class="tab-pane active">
                    <h3>Fiche véhicule</h3>
                    <form id="vehicule-form" class="form-grid">
                        <div class="form-row">
                            <input type="text" id="immat" placeholder="Immatriculation" required>
                            <input type="text" id="vin" placeholder="VIN">
                        </div>
                        <div class="form-row">
                            <select id="marque" required>
                                <option value="">Marque</option>
                                <option>Peugeot</option>
                                <option>Renault</option>
                                <option>Citroën</option>
                                <option>Volkswagen</option>
                                <option>BMW</option>
                                <option>Mercedes-Benz</option>
                                <option>Audi</option>
                                <option>Toyota</option>
                                <option>Ford</option>
                            </select>
                            <input type="text" id="modele" placeholder="Modèle" required>
                        </div>
                        <div class="form-row">
                            <input type="text" id="motorisation" placeholder="Motorisation">
                            <input type="number" id="annee" placeholder="Année">
                        </div>
                        <div class="form-row">
                            <input type="number" id="km" placeholder="Kilométrage" required>
                            <input type="text" id="client" placeholder="Client" required>
                        </div>
                        <div class="form-row">
                            <input type="tel" id="tel" placeholder="Téléphone">
                        </div>
                        <textarea id="notes" placeholder="Notes" rows="3"></textarea>
                        <button type="submit">Enregistrer le véhicule</button>
                    </form>

                    <div id="vehicules-list" class="list-container"></div>
                </div>

                <div id="interventions-tab" class="tab-pane" style="display:none;">
                    <h3>Intervention</h3>
                    <form id="intervention-form" class="form-grid">
                        <select id="vehicule-select" required>
                            <option value="">Choisir un véhicule</option>
                        </select>
                        <input type="text" id="intitule" placeholder="Intitulé" required>
                        <textarea id="diag" placeholder="Diagnostic / travaux" rows="3"></textarea>
                        <textarea id="pieces" placeholder="Pièces" rows="2"></textarea>
                        <div class="form-row">
                            <input type="text" id="main-oeuvre" placeholder="Main d'œuvre">
                            <input type="number" id="cout" placeholder="Coût (€)">
                        </div>
                        <input type="text" id="technicien" placeholder="Technicien">
                        <button type="submit">Enregistrer</button>
                    </form>

                    <div id="interventions-list" class="list-container"></div>
                </div>

                <div id="historique-tab" class="tab-pane" style="display:none;">
                    <h3>Historique complet</h3>
                    <div id="historique-content"></div>
                </div>

                <div id="export-tab" class="tab-pane" style="display:none;">
                    <h3>📤 Rapport, export et partage</h3>
                    <div class="export-actions">
                        <button id="btn-export-pdf">📄 Générer rapport PDF</button>
                        <button id="btn-export-zip">📦 Exporter ZIP atelier</button>
                        <button id="btn-share">📤 Partager synthèse</button>
                    </div>
                </div>
            </div>
        `;

        this.setupEvents(container);
        this.loadData(container);
        return container;
    }

    private setupEvents(container: HTMLElement) {
        // Tabs
        container.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = (e.target as HTMLElement).dataset.tab;
                container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                container.querySelectorAll('.tab-pane').forEach(p => p.style.display = 'none');
                
                (e.target as HTMLElement).classList.add('active');
                container.querySelector(`#${tab}-tab`)!.style.display = 'block';
            });
        });

        // Form véhicule
        container.querySelector('#vehicule-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveVehicule(container);
        });

        // Form intervention
        container.querySelector('#intervention-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveIntervention(container);
        });

        // Export
        container.querySelector('#btn-export-pdf')?.addEventListener('click', () => this.exportPDF());
        container.querySelector('#btn-export-zip')?.addEventListener('click', () => this.exportZIP());
        container.querySelector('#btn-share')?.addEventListener('click', () => this.share());
    }

    private async loadData(container: HTMLElement) {
        this.vehicules = JSON.parse(localStorage.getItem('vehicules') || '[]');
        this.interventions = JSON.parse(localStorage.getItem('interventions') || '[]');
        
        this.renderVehiculesList(container);
        this.renderInterventionsList(container);
        this.updateVehiculeSelect(container);
    }

    private saveVehicule(container: HTMLElement) {
        const vehicule: Vehicule = {
            id: Date.now(),
            immatriculation: (container.querySelector('#immat') as HTMLInputElement).value,
            vin: (container.querySelector('#vin') as HTMLInputElement).value,
            marque: (container.querySelector('#marque') as HTMLSelectElement).value,
            modele: (container.querySelector('#modele') as HTMLInputElement).value,
            motorisation: (container.querySelector('#motorisation') as HTMLInputElement).value,
            annee: parseInt((container.querySelector('#annee') as HTMLInputElement).value) || 0,
            kilometrage: parseInt((container.querySelector('#km') as HTMLInputElement).value),
            client: (container.querySelector('#client') as HTMLInputElement).value,
            telephone: (container.querySelector('#tel') as HTMLInputElement).value,
            notes: (container.querySelector('#notes') as HTMLTextAreaElement).value,
            createdAt: new Date().toISOString()
        };

        this.vehicules.push(vehicule);
        localStorage.setItem('vehicules', JSON.stringify(this.vehicules));

        (container.querySelector('#vehicule-form') as HTMLFormElement).reset();
        this.renderVehiculesList(container);
        this.updateVehiculeSelect(container);
        
        alert('Véhicule enregistré avec succès');
    }

    private saveIntervention(container: HTMLElement) {
        const intervention: Intervention = {
            id: Date.now(),
            vehiculeId: parseInt((container.querySelector('#vehicule-select') as HTMLSelectElement).value),
            intitule: (container.querySelector('#intitule') as HTMLInputElement).value,
            diagnostic: (container.querySelector('#diag') as HTMLTextAreaElement).value,
            pieces: (container.querySelector('#pieces') as HTMLTextAreaElement).value,
            mainOeuvre: (container.querySelector('#main-oeuvre') as HTMLInputElement).value,
            cout: parseFloat((container.querySelector('#cout') as HTMLInputElement).value) || 0,
            technicien: (container.querySelector('#technicien') as HTMLInputElement).value,
            date: new Date().toISOString(),
            synchronized: false
        };

        this.interventions.push(intervention);
        localStorage.setItem('interventions', JSON.stringify(this.interventions));

        (container.querySelector('#intervention-form') as HTMLFormElement).reset();
        this.renderInterventionsList(container);
        
        alert('Intervention enregistrée');
    }

    private renderVehiculesList(container: HTMLElement) {
        const listEl = container.querySelector('#vehicules-list') as HTMLElement;
        
        if (this.vehicules.length === 0) {
            listEl.innerHTML = '<p class="empty">Aucun véhicule enregistré</p>';
            return;
        }

        listEl.innerHTML = this.vehicules.map(v => `
            <div class="list-item">
                <strong>${v.immatriculation}</strong> - ${v.marque} ${v.modele}
                <span class="client">${v.client}</span>
                <span class="km">${v.kilometrage} km</span>
            </div>
        `).join('');
    }

    private renderInterventionsList(container: HTMLElement) {
        const listEl = container.querySelector('#interventions-list') as HTMLElement;
        
        if (this.interventions.length === 0) {
            listEl.innerHTML = '<p class="empty">Aucune intervention</p>';
            return;
        }

        listEl.innerHTML = this.interventions.map(i => {
            const vehicule = this.vehicules.find(v => v.id === i.vehiculeId);
            return `
                <div class="list-item">
                    <strong>${i.intitule}</strong>
                    <span>${vehicule?.immatriculation || 'Véhicule inconnu'}</span>
                    <span class="cout">${i.cout}€</span>
                    <span class="date">${new Date(i.date).toLocaleDateString('fr-FR')}</span>
                </div>
            `;
        }).join('');
    }

    private updateVehiculeSelect(container: HTMLElement) {
        const select = container.querySelector('#vehicule-select') as HTMLSelectElement;
        select.innerHTML = '<option value="">Choisir un véhicule</option>' +
            this.vehicules.map(v => `<option value="${v.id}">${v.immatriculation} - ${v.marque} ${v.modele}</option>`).join('');
    }

    private async exportPDF() {
        alert('Fonctionnalité PDF en cours de développement. Utilisez window.print() pour le moment.');
        window.print();
    }

    private async exportZIP() {
        const data = {
            vehicules: this.vehicules,
            interventions: this.interventions,
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `atelier-export-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    private async share() {
        const summary = `Atelier Export - ${this.vehicules.length} véhicules, ${this.interventions.length} interventions`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Export Atelier',
                    text: summary
                });
            } catch (err) {
                console.error('Erreur partage:', err);
            }
        } else {
            alert(summary);
        }
    }
}
