import {TextBlock} from "@anthropic-ai/sdk/resources";
import 'dotenv/config';

import "./env.js";

import {bot, setBotHandlers} from "./bot.js";
import {ai, MODEL} from "./ai.js";
import {initDb, saveMessage, flush, getHistory, closeDb} from "./db.js";
import {SYSTEM_PROMPT} from "./prompts/system.js";
import {runAgent} from "./agent.js";

async function onTextMessage(chatId: number, text: string) {
    try {
        saveMessage(chatId, "user", text);
        const history = getHistory(chatId);

        const reply = await runAgent(history);

        const textBlock = response.content.find(
            (block): block is TextBlock => block.type === "text"
        );

        const reply = textBlock?.text ?? "No response from AI.";
        saveMessage(chatId, "assistant", reply);
        return reply;
    } catch (error) {
        console.error("AI error:", error);
        return "Something went wrong. Try again.";
    } finally {
        flush();
    }
}

function shutdown() {
    console.log("Shutting down...");
    bot.stop();
    closeDb();
    process.exit(0);
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

async function main(): Promise<void> {
    try {
        await initDb();
        setBotHandlers(onTextMessage);
        await bot.start();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

main();