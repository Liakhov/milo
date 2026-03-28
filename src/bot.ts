import {Bot} from "grammy";

export const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);

bot.catch((err) => {
    console.error("Bot error:", err.message);
});

export const setBotHandlers = (onTextMessage: (chatId: number, text: string) => Promise<string>) => {
    bot.on("message:text", async (ctx) => {
        await ctx.replyWithChatAction("typing");
        const reply = await onTextMessage(ctx.chat.id, ctx.message.text);
        await ctx.reply(reply);
    });
}