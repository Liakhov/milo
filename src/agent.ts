import { MessageParam } from '@anthropic-ai/sdk/resources';
import { ai, MODEL } from './ai.js';
import { buildSystemPrompt, detectSkill } from './context.js';
import { getTools } from './tools/index.js';
import { logger } from './logger.js';

const log = logger('agent');

const MAX_TURNS = 5;

export async function runAgent(chatId: number, history: MessageParam[]): Promise<string> {
    let activeSkill: string | undefined;
    let turns = 0;

    while (turns < MAX_TURNS) {
        turns++;
        log.debug(`Turn ${turns}/${MAX_TURNS}`, { chat_id: chatId, activeSkill, messages: history.length });

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

            const toolsUsed = response.content
              .filter(block => block.type === 'tool_use' || block.type === 'server_tool_use')
              .map(block => block.name);

            const searchQueries = response.content
              .filter(block => block.type === 'server_tool_use' && block.name === 'web_search')
              .map(block => (block as { input: { query: string } }).input.query);

            const { usage } = response;
            log.info('Claude response', {
                chat_id: chatId,
                model: MODEL,
                turn: `${turns}/${MAX_TURNS}`,
                stop_reason: response.stop_reason,
                tokens_in: usage.input_tokens,
                tokens_out: usage.output_tokens,
                cache_read: usage.cache_read_input_tokens ?? 0,
                cache_write: usage.cache_creation_input_tokens ?? 0,
                tools: toolsUsed.length > 0 ? toolsUsed.join(', ') : undefined,
                search: searchQueries.length > 0 ? searchQueries.join(' | ') : undefined,
                skill: activeSkill
            });

            const detectedSkill = detectSkill(responseText);
            if (detectedSkill && activeSkill !== detectedSkill) {
                log.info(`Skill activated: ${detectedSkill}`, { chat_id: chatId });
                activeSkill = detectedSkill;
                continue;
            }

            return responseText;
        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            log.error('Agent turn failed', { chat_id: chatId, error: err.message });
            return 'Something went wrong. Try again.';
        }
    }
    return `Can't complete the request in ${MAX_TURNS} turns.`;
}
