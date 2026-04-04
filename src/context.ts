import path from 'path';
import fs from 'fs';

type SystemBlock = {
    type: 'text';
    text: string;
    cache_control?: { type: 'ephemeral' };
};

export const buildSystemPrompt = (): SystemBlock[] => {
    const blocks: SystemBlock[] = [];

    const soul = loadSoul();
    if (soul) {
        blocks.push({ type: 'text', text: soul, cache_control: { type: 'ephemeral' } });
    }

    return blocks;
};


export const loadSoul = () => {
    const userDir = path.join(import.meta.dirname, '..', 'user');
    const soulPath = path.join(userDir, 'SOUL.md');

    if (!fs.existsSync(soulPath)) return '';

    return fs.readFileSync(soulPath, 'utf-8');
};
