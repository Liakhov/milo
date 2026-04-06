import { Bot } from 'grammy';

import { env } from '../env.js';
import { stt } from '../stt.js';
import { logger } from '../logger.js';
import { botMiddleware } from './middleware.js';
import { downloadTelegramFile } from './utils.js';

const log = logger('bot');

export const bot = new Bot(env.telegramToken);

bot.use(botMiddleware);

bot.catch((err) => {
    log.error('Bot error', { error: String(err.error ?? err.message) });
});

type MessageHandler = (chatId: number, text: string) => Promise<string>;

export const setBotHandlers = (onMessage: MessageHandler) => {
    const privateChat = bot.chatType('private');

    privateChat.command('start', async (ctx) => {
        const name = ctx.from?.first_name || 'there';

        await ctx.reply(
          `👋 <b>Hello, ${name}! I'm MILO.</b>\n\n` +
          `I am your private AI assistant, ready to help you with tasks, questions, or just a quick brainstorm.\n\n` +
          `<b>What can I do?</b>\n` +
          `• 💬 <b>Text:</b> Send me any question or thought.\n` +
          `• 🎙️ <b>Voice:</b> I'll transcribe and respond to your voice notes.\n` +
          `• 🧠 <b>Context:</b> I remember our conversation history.\n\n` +
          `<i>Just send me a message to begin!</i>`,
          { parse_mode: 'HTML' }
        );
    });

    privateChat.on('message:text', async (ctx) => {
        try {
            await ctx.replyWithChatAction('typing');
            const reply = await onMessage(ctx.chat.id, ctx.message.text);

            if (reply) {
                await ctx.reply(reply);
            }
        } catch (error) {
            log.error('Text handler error', { chatId: ctx.chat.id, error });
            await ctx.reply('Sorry, I encountered an error processing your message.');
        }
    });

    privateChat.on('message:voice', async (ctx) => {
        await ctx.replyWithChatAction('typing');

        try {
            const file = await ctx.getFile();
            if (!file.file_path) {
                await ctx.reply('Could not access the voice message.');
                return;
            }

            const buffer = await downloadTelegramFile(file.file_path);
            const transcript = await stt(buffer, 'voice.ogg');

            if (!transcript) {
                return ctx.reply('I couldn\'t hear anything.');
            }

            const reply = await onMessage(ctx.chat.id, transcript);
            if (reply) {
                await ctx.reply(reply);
            }
        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            log.error('Voice handler failed', { error: err.message });
            await ctx.reply('Failed to process voice message. Try again.');
        }
    });
};
