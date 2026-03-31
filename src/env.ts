const required = [
    "TELEGRAM_BOT_TOKEN",
    "ANTHROPIC_API_KEY",
    "OPENAI_API_KEY",
] as const;

for (const key of required) {
    if (!process.env[key]) {
        throw new Error(`Missing required env var: ${key}`);
    }
}

export const env = {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY!,
    telegramToken: process.env.TELEGRAM_BOT_TOKEN!,
    openaiApiKey: process.env.OPENAI_API_KEY!,
};