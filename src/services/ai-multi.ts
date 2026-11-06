import { HfInference } from '@huggingface/inference';

export class AIMultiService {
    private hf: HfInference;

    constructor() {
        // Mode anonyme (gratuit avec rate limiting)
        this.hf = new HfInference();
    }

    async queryMultiple(prompt: string): Promise<string[]> {
        const models = [
            'mistralai/Mixtral-8x7B-Instruct-v0.1',
            'google/gemma-7b-it',
            'microsoft/phi-2'
        ];

        const results = await Promise.allSettled(
            models.map(model => this.queryModel(model, prompt))
        );

        return results
            .filter(r => r.status === 'fulfilled')
            .map(r => (r as PromiseFulfilledResult<string>).value);
    }

    private async queryModel(model: string, prompt: string): Promise<string> {
        try {
            const response = await this.hf.textGeneration({
                model: model,
                inputs: prompt,
                parameters: {
                    max_new_tokens: 1024,
                    temperature: 0.7
                }
            });
            return response.generated_text;
        } catch (error) {
            console.error(`Erreur modèle ${model}:`, error);
            throw error;
        }
    }

    async analyzeWithConsensus(symptome: string): Promise<{
        results: string[];
        consensus: string;
    }> {
        const prompt = `Analyse ce symptôme automobile: ${symptome}
        Fournis diagnostic technique, causes et solutions.`;

        const results = await this.queryMultiple(prompt);
        
        // Générer un consensus simple
        const consensus = results.length > 0 
            ? results[0] 
            : 'Aucune réponse disponible';

        return { results, consensus };
    }
}
