import Anthropic from "@anthropic-ai/sdk";
import {env} from "./env.js";

export const MODEL = "claude-haiku-4-5-20251001";

export const ai = new Anthropic({
    apiKey: env.anthropicApiKey
});