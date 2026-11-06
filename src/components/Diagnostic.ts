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
                <textarea id="sympt
