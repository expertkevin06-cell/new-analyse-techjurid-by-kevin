import { CreateWebWorkerMLCEngine, MLCEngine } from '@mlc-ai/web-llm';

export class AILocalService {
    private engine: MLCEngine | null = null;
    private modelLoaded: boolean = false;

    async init() {
        try {
            console.log('[AI Local] Initialisation du moteur...');
            this.engine = await CreateWebWorkerMLCEngine(
                new Worker(new URL('./ai-worker.ts', import.meta.url), { type: 'module' }),
                'Llama-3-8B-Instruct-q4f16_1-MLC',
                {
                    initProgressCallback: (progress) => {
                        console.log(`[AI Local] Progress: ${progress.progress}%`);
                    }
                }
            );
            this.modelLoaded = true;
            console.log('[AI Local] Modèle chargé avec succès');
        } catch (error) {
            console.error('[AI Local] Erreur init:', error);
            this.modelLoaded = false;
        }
    }

    async analyze(symptome: string, codeDTC?: string): Promise<string> {
        if (!this.engine || !this.modelLoaded) {
            throw new Error('Modèle IA non chargé');
        }

        const prompt = `Tu es un expert automobile spécialisé en diagnostic technique et juridique.
        
Symptôme: ${symptome}
${codeDTC ? `Code DTC: ${codeDTC}` : ''}

Fournis:
1. Diagnostic technique détaillé
2. Causes possibles
3. Solutions recommandées
4. Aspects juridiques (vices cachés, garanties, responsabilité)
5. Conseils de procédure

Réponds de manière structurée et professionnelle.`;

        const reply = await this.engine.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 2048
        });

        return reply.choices[0].message.content || 'Erreur de génération';
    }

    isReady(): boolean {
        return this.modelLoaded && this.engine !== null;
    }
}
