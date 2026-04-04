import { MessageParam } from '@anthropic-ai/sdk/resources';
import { ai, MODEL } from './ai.js';
import { buildSystemPrompt, detectSkill } from './context.js';
import { getTools } from './tools/index.js';

const MAX_TURNS = 5;

export async function runAgent(history: MessageParam[]): Promise<string> {
    let activeSkill: string | undefined;
    let turns = 0;

    while (turns < MAX_TURNS) {
        turns++;

        try {
            const response = await ai.messages.create({
                model: MODEL,
                max_tokens: 1024,
                system: buildSystemPrompt(activeSkill),
                messages: history,
                tools: getTools()
            });

            const responseText = response.content
              .filter(block => block.type === 'text')
              .map(block => block.text)
              .join('');

            const detectedSkill = detectSkill(responseText);
            if (detectedSkill && activeSkill !== detectedSkill) {
                activeSkill = detectedSkill;
                continue;
            }

            return responseText;
        } catch (error) {
            console.error('Agent error:', error);
            return 'Something went wrong. Try again.';
        }
    }
    return `Can't complete the request in ${MAX_TURNS} turns.`;
}
