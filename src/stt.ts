import { OpenAI } from 'openai';

import { env } from './env.js';

export const VOICE_DISABLED_MESSAGE = 'Voice messages are disabled. Add OPENAI_API_KEY to enable them.';

let openai: OpenAI | undefined;

export function isVoiceEnabled(): boolean {
    return Boolean(env.openaiApiKey);
}

function getOpenAIClient(): OpenAI {
    const apiKey = env.openaiApiKey;

    if (!apiKey) {
        throw new Error(VOICE_DISABLED_MESSAGE);
    }

    openai ??= new OpenAI({ apiKey });

    return openai;
}

export async function stt(file: Buffer, filename = 'voice.ogg'): Promise<string> {
    return getOpenAIClient().audio.transcriptions.create({
        file: new File([file], filename),
        model: 'gpt-4o-mini-transcribe',
        response_format: 'text'
    });
}
