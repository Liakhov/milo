import { MessageParam, TextBlock } from '@anthropic-ai/sdk/resources';
import { ai, MODEL } from './ai.js';
import { SYSTEM_PROMPT } from './prompts/system.js';
import { getTools } from './tools/index.js';

export async function runAgent(history: MessageParam[]): Promise<string> {
    const response = await ai.messages.create({
        model: MODEL,
        max_tokens: 1024,
        system: [
            {
                type: 'text',
                text: SYSTEM_PROMPT,
                cache_control: { type: 'ephemeral' }
            }
        ],
        messages: history,
        tools: getTools()
    });

    const text = response.content
      .filter((block): block is TextBlock => block.type === 'text')
      .map(block => block.text)
      .join('');

    return text || 'No response from AI.';
}
