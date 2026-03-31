import {MessageParam, TextBlock} from "@anthropic-ai/sdk/resources";
import {ai, MODEL} from "./ai.js";
import {SYSTEM_PROMPT} from "./prompts/system.js";

export async function runAgent(history: MessageParam[]): Promise<string> {
    const response = await ai.messages.create({
        model: MODEL,
        max_tokens: 1024,
        system: [
            {
                type: "text",
                text: SYSTEM_PROMPT,
                cache_control: {type: "ephemeral"},
            },
        ],
        messages: history,
    });

    const textBlock = response.content.find(
        (block): block is TextBlock => block.type === "text"
    );

    return textBlock?.text ?? "No response from AI.";
}