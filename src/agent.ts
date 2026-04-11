import { MessageParam } from '@anthropic-ai/sdk/resources';
import { ai, MODEL } from './ai.js';
import { buildSystemPrompt, detectSkill } from './context.js';
import { executeTool, getTools } from './tools/index.js';
import { logger } from './logger.js';

const log = logger('agent');

const MAX_TURNS = 10;
const MAX_TOKENS = 4096;

export async function runAgent(chatId: number, history: MessageParam[]): Promise<string> {
    let activeSkill: string | undefined;
    let turns = 0;
    const messages: MessageParam[] = structuredClone(history);

    while (turns < MAX_TURNS) {
        turns++;

        try {
            const response = await ai.messages.create({
                model: MODEL,
                max_tokens: MAX_TOKENS,
                system: buildSystemPrompt(activeSkill),
                messages,
                tools: getTools()
            });

            const responseText = response.content
              .filter(block => block.type === 'text')
              .map(block => block.text)
              .join('');

            // Custom tools — defined in getTools(), executed locally via executeTool().
            // We must process these manually: run the logic, then return tool_result back to the model.
            const toolUseBlocks = response.content
              .filter(block => block.type === 'tool_use');

            // Built-in Anthropic tools (e.g. web_search) — executed server-side automatically.
            // No manual handling needed; collected here for logging only.
            const serverToolNames = response.content
              .filter(block => block.type === 'server_tool_use')
              .map(block => block.name);

            const searchQueries = response.content
              .filter(block => block.type === 'server_tool_use' && block.name === 'web_search')
              .map(block => (block as { input: { query: string } }).input.query);

            const { usage, stop_reason } = response;

            log.info('Claude response', {
                chat_id: chatId,
                turn: `${turns}/${MAX_TURNS}`,
                status: {
                    stop_reason,
                    active_skill: activeSkill || 'none',
                    has_text: responseText.length > 0,
                    custom_tools: toolUseBlocks.length,
                    server_tools: serverToolNames.length
                },
                tools: [...toolUseBlocks.map(b => b.name), ...serverToolNames].join(', ') || undefined,
                search: searchQueries.length > 0 ? searchQueries.join(' | ') : undefined,
                tokens: {
                    in: usage.input_tokens,
                    out: usage.output_tokens,
                    cache_hit: usage.cache_read_input_tokens ?? 0,
                    total: usage.input_tokens + usage.output_tokens
                },
                messages_count: messages.length,
                response_preview: responseText.slice(0, 200),
                model: MODEL
            });

            if (stop_reason === 'tool_use' && toolUseBlocks.length) {
                messages.push({ role: 'assistant', content: response.content });

                const toolResults = response.content.filter(block => block.type === 'tool_use')
                  .map(block => {
                      try {
                          const result = executeTool(block.name, block.input as Record<string, unknown>);
                          return { type: 'tool_result' as const, tool_use_id: block.id, content: result };
                      } catch (error) {
                          const err = error instanceof Error ? error.message : String(error);
                          log.error('Tool execution failed', { tool: block.name, error: err });
                          return {
                              type: 'tool_result' as const,
                              tool_use_id: block.id,
                              content: `Error: ${err}`,
                              is_error: true
                          };
                      }
                  });

                log.info('Tool execution results', {
                    chat_id: chatId,
                    results: toolResults.map(r => ({
                        id: r.tool_use_id,
                        is_error: !!r.is_error,
                        content: r.content.slice(0, 100)
                    }))
                });

                messages.push({ role: 'user', content: toolResults });
                continue;
            }

            // Check for skill activation
            const detectedSkill = detectSkill(responseText);
            if (detectedSkill && activeSkill !== detectedSkill) {
                log.info(`Skill activated: ${detectedSkill}`, { chat_id: chatId });
                activeSkill = detectedSkill;
                continue;
            }

            if (!responseText && stop_reason === 'end_turn') {
                log.warn('Empty response from Claude', { chat_id: chatId, turn: `${turns}/${MAX_TURNS}` });
                return 'Sorry, I was unable to generate a response. Please try rephrasing your question.';
            }

            return responseText;
        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            log.error('Agent turn failed', {
                chat_id: chatId,
                turn: `${turns}/${MAX_TURNS}`,
                error: err.message,
                stack: err.stack
            });
            return 'Something went wrong. Try again.';
        }
    }
    log.warn('Agent exhausted max turns', { chat_id: chatId, turns: MAX_TURNS });
    return `Couldn't complete the request in ${MAX_TURNS} turns.`;
}
