import { Tool, ToolUnion } from '@anthropic-ai/sdk/resources';
import { readData, writeData } from './data.js';
import { logger } from '../logger.js';

const log = logger('tools');

export function getTools(): ToolUnion[] {
    return [webSearchTool, readDataTool, writeDataTool];
}

export function executeTool(name: string, input: Record<string, unknown>): string {
    log.info('Executing tool', { name });
    switch (name) {
        case 'read_data':
            return readData(input);
        case 'write_data':
            return writeData(input);
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}

export const webSearchTool: ToolUnion = {
    type: 'web_search_20250305',
    name: 'web_search',
    max_uses: 5
};

const readDataTool: Tool = {
    name: 'read_data',
    description: 'Read a file from user/memory/. Returns file contents or "(empty)" if not found.',
    input_schema: {
        type: 'object' as const,
        properties: {
            path: {
                type: 'string',
                description: 'Relative path under user/memory/ (e.g. "memory/learned.md", "memory/fitness/workouts.md")'
            }
        },
        required: ['path']
    }
};

const writeDataTool: Tool = {
    name: 'write_data',
    description: 'Write or append content to a file under user/memory/. Creates parent directories if needed.',
    input_schema: {
        type: 'object' as const,
        properties: {
            path: {
                type: 'string',
                description: 'Relative path under user/memory/ (e.g. "memory/learned.md", "memory/fitness/weight.md")'
            },
            content: {
                type: 'string',
                description: 'Content to write'
            },
            mode: {
                type: 'string',
                enum: ['overwrite', 'append'],
                description: 'overwrite replaces the file, append adds to the end'
            }
        },
        required: ['path', 'content', 'mode']
    }
};