import { MessageParam, TextBlock } from '@anthropic-ai/sdk/resources';
import { ai, MODEL } from './ai.js';
import { getTools } from './tools/index.js';
import { buildSystemPrompt } from './context.js';

export async function runAgent(history: MessageParam[]): Promise<string> {
    const response = await ai.messages.create({
        model: MODEL,
        max_tokens: 1024,
        system: buildSystemPrompt(),
        messages: history,
        tools: getTools()
    });

    const text = response.content
      .filter((block): block is TextBlock => block.type === 'text')
      .map(block => block.text)
      .join('');

    return text || 'No response from AI.';
}
