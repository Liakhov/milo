import 'dotenv/config';

import './env.js';

import { bot, setBotHandlers } from './bot/index.js';
import { runAgent } from './agent.js';
import { closeDb, getHistory, initDb, saveMessage } from './db.js';
import { logger } from './logger.js';

const log = logger('index');

async function onMessage(chatId: number, text: string): Promise<string> {
    try {
        log.info('Message received', { chat_id: chatId, length: text.length, text: text.slice(0, 200) });

        saveMessage(chatId, 'user', text);
        const history = getHistory(chatId);

        const reply = await runAgent(chatId, history);

        saveMessage(chatId, 'assistant', reply);

        log.info('Reply sent', { chat_id: chatId, length: reply.length, text: reply.slice(0, 200) });
        return reply;
    } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        log.error('AI error', { chat_id: chatId, error: err.message });
        return 'Something went wrong. Try again.';
    }
}

function shutdown() {
    log.info('Shutting down...');
    bot.stop();
    closeDb();
    process.exit(0);
}

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);

async function main(): Promise<void> {
    try {
        await initDb();
        log.info('Database initialized');
        setBotHandlers(onMessage);
        await bot.start();
        log.info('Bot started');
    } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        log.error('Startup failed', { error: err.message });
        process.exit(1);
    }
}

await main();
