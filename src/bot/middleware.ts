import { Context, NextFunction } from 'grammy';
import { logger } from '../logger.js';
import { env } from '../env.js';

const log = logger('botMiddleware');

export const botMiddleware = async (ctx: Context, next: NextFunction) => {
    const from = ctx.from;

    // Verify that the update comes from a valid user and not another bot
    if (!from || from.is_bot) {
        log.warn('Access denied: Unauthorized source or bot detected', {
            userId: from?.id,
            username: from?.username,
            isBot: from?.is_bot,
            chatType: ctx.chat?.type
        });
        return;
    }

    const isPublicMode = !env.allowedUserIds.length;
    const isAllowedAccess = isPublicMode || env.allowedUserIds.includes(from.id);
    if (!isAllowedAccess) {
        log.warn('Unauthorized access blocked', {
            userId: from.id,
            username: from.username
        });

        if (ctx.chat?.type === 'private') {
            await ctx.reply(
              `<b>🔒 Access Restricted</b>\n\n` +
              `Hello! This is <b>MILO</b>, a private AI assistant. 🤖\n\n` +
              `Currently, only authorized users can interact with me. If you believe this is a mistake, please contact your administrator.\n\n` +
              `🆔 <b>Your ID:</b> <code>${from.id}</code>`,
              { parse_mode: 'HTML' }
            );
        }
        return;
    }

    await next();
};
