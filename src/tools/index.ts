import { ToolUnion } from '@anthropic-ai/sdk/resources';

export function getTools(): ToolUnion[] {
    return [webSearchTool];
}

export const webSearchTool: ToolUnion = {
    type: 'web_search_20250305',
    name: 'web_search',
    max_uses: 5
};
