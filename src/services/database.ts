import Dexie, { Table } from 'dexie';

export interface Panne {
    id?: number;
    code: string;
    symptome: string;
    composant: string;
    systeme: string;
    marque?: string;
    modele?: string;
    motorisation?: string;
    gravite: 'critique' | 'important' | 'modere';
    tsc?: string;
    solution?: string;
    juridique?: string;
}

export interface Juridique {
    id?: number;
    type: string;
    article: string;
    description: string;
    jurisprudence?: string;
    application?: string;
}

export class DatabaseService extends Dexie {
    pannes!: Table<Panne>;
    juridique!: Table<Juridique>;

    constructor() {
        super('ExpertAutoDB');
        this.version(1).stores({
            pannes: '++id, code, symptome, composant, systeme, marque, modele, gravite',
            juridique: '++id, type, article'
        });
    }

    async init() {
        try {
            // Vérifier si la base est vide
            const count = await this.pannes.count();
            if (count === 0) {
                await this.loadDefaultData();
            }
        } catch (error) {
            console.error('Erreur init DB:', error);
        }
    }

    private async loadDefaultData() {
        // Charger les données par défaut
        const pannesData = await this.fetchPannesData();
        if (pannesData.length > 0) {
            await this.pannes.bulkAdd(pannesData);
        }

        const juridiqueData = await this.fetchJuridiqueData();
        if (juridiqueData.length > 0) {
            await this.juridique.bulkAdd(juridiqueData);
        }
    }

    private async fetchPannesData(): Promise<Panne[]> {
        try {
            const response = await fetch(`${import.meta.env.BASE_URL}data/pannes-massive.json`);
            return await response.json();
        } catch {
            // Données de fallback
            return [
                {
                    code: 'P0300',
                    symptome: 'Ratés d\'allumage aléatoires',
                    composant: 'Bougies d\'allumage',
                    systeme: 'Moteur',
                    gravite: 'important',
                    solution: 'Vérifier et remplacer les bougies'
                }
            ];
        }
    }

    private async fetchJuridiqueData(): Promise<Juridique[]> {
        try {
            const response = await fetch(`${import.meta.env.BASE_URL}data/juridique-massive.json`);
            return await response.json();
        } catch {
            return [
                {
                    type: 'Vice caché',
                    article: 'Art. 1641 Code Civil',
                    description: 'Défaut caché rendant le véhicule impropre à son usage'
                }
            ];
        }
    }

    async searchPannes(query: string): Promise<Panne[]> {
        return await this.pannes
            .filter(p => 
                p.code.toLowerCase().includes(query.toLowerCase()) ||
                p.symptome.toLowerCase().includes(query.toLowerCase()) ||
                p.composant.toLowerCase().includes(query.toLowerCase())
            )
            .toArray();
    }

    async searchJuridique(query: string): Promise<Juridique[]> {
        return await this.juridique
            .filter(j =>
                j.type.toLowerCase().includes(query.toLowerCase()) ||
                j.article.toLowerCase().includes(query.toLowerCase()) ||
                j.description.toLowerCase().includes(query.toLowerCase())
            )
            .toArray();
    }

    async getStatistics() {
        const pannesCount = await this.pannes.count();
        const juridiqueCount = await this.juridique.count();
        return { pannesCount, juridiqueCount };
    }
}
