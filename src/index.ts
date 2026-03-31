import 'dotenv/config';

import "./env.js";

import {bot, setBotHandlers} from "./bot.js";
import {runAgent} from "./agent.js";
import {closeDb, flush, getHistory, initDb, saveMessage} from "./db.js";

async function onMessage(chatId: number, text: string) {
    try {
        saveMessage(chatId, "user", text);
        const history = getHistory(chatId);

        const reply = await runAgent(history);

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
        setBotHandlers(onMessage);
        await bot.start();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

main();