import 'dotenv/config';

import "./env.js";

import {bot, setBotHandlers} from "./bot.js";
import {runAgent} from "./agent.js";
import {closeDb, getHistory, initDb, saveMessage} from "./db.js";
import {logger} from "./logger.js";

const log = logger("index");

async function onMessage(chatId: number, text: string): Promise<string> {
    try {
        saveMessage(chatId, "user", text);
        const history = getHistory(chatId);

        const reply = await runAgent(history);

        saveMessage(chatId, "assistant", reply);
        return reply;
    } catch (error) {
        log.error("AI error", error);
        return "Something went wrong. Try again.";
    }
}

function shutdown() {
    log.info("Shutting down...");
    bot.stop();
    closeDb();
    process.exit(0);
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

async function main(): Promise<void> {
    try {
        await initDb();
        log.info("Database initialized");
        setBotHandlers(onMessage);
        await bot.start();
        log.info("Bot started");
    } catch (error) {
        log.error("Startup failed", error);
        process.exit(1);
    }
}

await main();