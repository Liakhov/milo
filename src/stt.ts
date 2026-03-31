import {OpenAI} from "openai";
import {env} from "./env.js";

const openai = new OpenAI({
    apiKey: env.openaiApiKey
});

export async function stt(file: Buffer, filename = "voice.ogg"): Promise<string> {
    return openai.audio.transcriptions.create({
        file: new File([file], filename),
        model: "gpt-4o-mini-transcribe",
        response_format: "text"
    });
}