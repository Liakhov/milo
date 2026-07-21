const required = [
    'TELEGRAM_BOT_TOKEN',
    'ANTHROPIC_API_KEY',
    'OPENAI_API_KEY'
] as const;

for (const key of required) {
    if (!process.env[key]) {
        throw new Error(`Missing required env var: ${key}`);
    }
}

function parsePublicMode(value: string | undefined): boolean {
    if (value === undefined || value === '' || value === 'false') return false;
    if (value === 'true') return true;

    throw new Error('PUBLIC_MODE must be either "true" or "false".');
}

function parseAllowedUserIds(value?: string): number[] {
    if (!value?.trim()) return [];

    return value.split(',').map(rawId => {
        const id = rawId.trim();
        const parsed = Number(id);

        if (!/^\d+$/.test(id) || !Number.isSafeInteger(parsed) || parsed <= 0) {
            throw new Error(`Invalid Telegram user ID in ALLOWED_USER_IDS: "${id}".`);
        }

        return parsed;
    });
}

const publicMode = parsePublicMode(process.env.PUBLIC_MODE);
const allowedUserIds = parseAllowedUserIds(process.env.ALLOWED_USER_IDS);

if (!publicMode && allowedUserIds.length === 0) {
    throw new Error(
      'ALLOWED_USER_IDS must contain at least one valid Telegram user ID. ' +
      'To intentionally allow public access, set PUBLIC_MODE=true.'
    );
}

export const env = {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY!,
    telegramToken: process.env.TELEGRAM_BOT_TOKEN!,
    openaiApiKey: process.env.OPENAI_API_KEY!,
    publicMode,
    allowedUserIds
};
