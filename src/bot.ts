import {Bot} from "grammy";

import {env} from "./env.js";
import {stt} from "./stt.js";
import {downloadTelegramFile} from "./telegram.js";

export const bot = new Bot(env.telegramToken);

bot.catch((err) => {
    console.error("Bot error:", err.message);
});

type MessageHandler = (chatId: number, text: string) => Promise<string>;

export const setBotHandlers = (onMessage: MessageHandler) => {
    bot.on("message:text", async (ctx) => {
        await ctx.replyWithChatAction("typing");
        const reply = await onMessage(ctx.chat.id, ctx.message.text);
        await ctx.reply(reply);
    });

    bot.on("message:voice", async (ctx) => {
        await ctx.replyWithChatAction("typing");

        try {
            const file = await ctx.getFile();
            if (!file.file_path) {
                await ctx.reply("Could not access the voice message.");
                return;
            }

            const buffer = await downloadTelegramFile(file.file_path);
            const transcript = await stt(buffer, "voice.ogg");

            const reply = await onMessage(ctx.chat.id, transcript);
            await ctx.reply(reply);
        } catch (error) {
            console.error("Voice handler error:", error);
            await ctx.reply("Failed to process voice message. Try again.");
        }
    });
}