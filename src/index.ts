import {TextBlock} from "@anthropic-ai/sdk/resources";
import 'dotenv/config';

import {bot, setBotHandlers} from "./bot";
import {ai, MODEL} from "./ai";
import {SYSTEM_PROMPT} from "./prompts/system";

async function onTextMessage(text: string) {
    try {
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
            messages: [{role: "user", content: text}],
        });

        const textBlock = response.content.find(
            (block): block is TextBlock => block.type === "text"
        );

        return textBlock?.text ?? "No response from AI.";
    } catch (error) {
        console.error("AI error:", error);
        return "Something went wrong. Try again.";
    }
}

function shutdown() {
    console.log("Shutting down...");
    bot.stop();
    process.exit(0);
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

async function main(): Promise<void> {
    try {
        setBotHandlers(onTextMessage);
        await bot.start();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

main();