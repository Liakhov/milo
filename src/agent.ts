import { MessageParam } from '@anthropic-ai/sdk/resources';
import { ai, MODEL } from './ai.js';
import { buildSystemPrompt, detectSkill } from './context.js';
import { getTools } from './tools/index.js';
import { logger } from './logger.js';

const log = logger("agent");

const MAX_TURNS = 5;

export async function runAgent(history: MessageParam[]): Promise<string> {
    let activeSkill: string | undefined;
    let turns = 0;

    while (turns < MAX_TURNS) {
        turns++;
        log.debug(`Turn ${turns}/${MAX_TURNS}`, { activeSkill });

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
                .filter(block => block.type === 'tool_use')
                .map(block => block.name);

            log.info("Claude response", {
                turn: `${turns}/${MAX_TURNS}`,
                tokens_in: response.usage.input_tokens,
                tokens_out: response.usage.output_tokens,
                ...(toolsUsed.length > 0 && { tools: toolsUsed.join(", ") }),
            });

            const detectedSkill = detectSkill(responseText);
            if (detectedSkill && activeSkill !== detectedSkill) {
                log.info(`Skill activated: ${detectedSkill}`);
                activeSkill = detectedSkill;
                continue;
            }

            return responseText;
        } catch (error) {
            log.error("Agent turn failed", error);
            return 'Something went wrong. Try again.';
        }
    }
    return `Can't complete the request in ${MAX_TURNS} turns.`;
}
