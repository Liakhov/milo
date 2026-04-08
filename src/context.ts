import path from 'path';
import fs from 'fs';

type SystemBlock = {
    type: 'text';
    text: string;
    cache_control?: { type: 'ephemeral' };
};

let cachedSkills: string[] | null = null;

export const buildSystemPrompt = (activeSkill: string | undefined): SystemBlock[] => {
    const blocks: SystemBlock[] = [];

    const soul = loadSoul();
    if (soul) {
        blocks.push({ type: 'text', text: soul, cache_control: { type: 'ephemeral' } });
    }

    blocks.push({
        type: 'text',
        text: `Current date: ${new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Kyiv' })} (Europe/Kyiv)`,
        cache_control: { type: 'ephemeral' }
    });

    const headers = loadSkillHeaders();
    if (headers) {
        blocks.push({
            type: 'text',
            text: `## Available skills

If the user's request matches one of the skills below, respond with ONLY /skill-name and nothing else.
Otherwise answer directly.

${headers}`,
            cache_control: { type: 'ephemeral' }
        });
    }

    if (activeSkill) {
        const skillContent = loadSkill(activeSkill);
        if (skillContent) {
            blocks.push({
                type: 'text',
                text: `## Instruction\nThe user's request matches the **${activeSkill}** skill. Use it now. Respond without name of the skill. Don't use Markdown headers if the response is shorter than 3 sentences`
            });

            blocks.push({
                type: 'text',
                text: skillContent
            });
        }
    }
    return blocks;
};


export const loadSoul = () => {
    const userDir = path.join(import.meta.dirname, '..', 'user');
    const soulPath = path.join(userDir, 'SOUL.md');

    if (!fs.existsSync(soulPath)) return '';

    return fs.readFileSync(soulPath, 'utf-8');
};

export const loadSkillHeaders = () => {
    const skillDir = path.join(import.meta.dirname, '..', '.claude', 'skills');
    if (!fs.existsSync(skillDir)) return '';

    return fs.readdirSync(skillDir)
      .filter(file => fs.statSync(path.join(skillDir, file)).isDirectory())
      .map(skill => {
          const skillPath = path.join(skillDir, skill, 'SKILL.md');
          if (!fs.existsSync(skillPath)) return null;

          const skillContent = fs.readFileSync(skillPath, 'utf-8');
          const match = skillContent.match(/^---\n([\s\S]*?)\n---/);
          return match ? match[1]?.trim() : null;
      })
      .filter(Boolean)
      .join('\n\n');
};

export const detectSkill = (response: string): string | null => {
    const skills = getSkills();

    for (const skill of skills) {
        if (response.includes(`/${skill}`)) return skill;
    }

    return null;
};

export const loadSkill = (skillName: string) => {
    const skillDir = path.join(import.meta.dirname, '..', '.claude', 'skills');
    if (!fs.existsSync(skillDir)) return '';

    const skillsPath = path.join(skillDir, skillName, 'SKILL.md');

    if (!fs.existsSync(skillsPath)) return '';

    return fs.readFileSync(skillsPath, 'utf-8');
};


const getSkills = (): string[] => {
    if (cachedSkills) return cachedSkills;

    const skillDir = path.join(import.meta.dirname, '..', '.claude', 'skills');
    if (!fs.existsSync(skillDir)) return [];

    cachedSkills = fs.readdirSync(skillDir)
      .filter(file => fs.statSync(path.join(skillDir, file)).isDirectory());

    return cachedSkills;
};
