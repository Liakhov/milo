import fs from 'fs';
import path from 'path';
import { logger } from '../logger.js';

const log = logger('data');

const userDir = path.join(import.meta.dirname, '..', '..', 'user');
const memoryDir = path.join(userDir, 'memory');

function resolveSafePath(filePath: unknown): string | null {
    if (!filePath || typeof filePath !== 'string') return null;
    const resolved = path.resolve(userDir, filePath);
    if (!resolved.startsWith(memoryDir + path.sep) && resolved !== memoryDir) return null;
    return resolved;
}

export function readData(input: Record<string, unknown>): string {
    const resolved = resolveSafePath(input.path);

    if (!resolved) {
        log.warn('Read blocked — invalid or restricted path', { path: input.path });
        return 'Error: path must be a valid relative path within user/memory/.';
    }

    if (!fs.existsSync(resolved)) {
        return '(empty)';
    }

    const content = fs.readFileSync(resolved, 'utf-8').trim();
    log.info('Read data', { path: path.relative(userDir, resolved) });
    return content || '(empty)';
}

export function writeData(input: Record<string, unknown>): string {
    const { path: filePath, content, mode } = input as { path: unknown; content: unknown; mode: unknown };

    if (!content || typeof content !== 'string') {
        return 'Error: content is required and must be a string.';
    }
    if (mode !== 'overwrite' && mode !== 'append') {
        return 'Error: mode must be "overwrite" or "append".';
    }

    const resolved = resolveSafePath(filePath);
    if (!resolved) {
        log.warn('Write blocked — invalid or restricted path', { path: filePath });
        return 'Error: path must be a valid relative path within user/memory/.';
    }

    fs.mkdirSync(path.dirname(resolved), { recursive: true });

    if (mode === 'append') {
        fs.appendFileSync(resolved, content, 'utf-8');
    } else {
        fs.writeFileSync(resolved, content, 'utf-8');
    }

    const relPath = path.relative(userDir, resolved);
    log.info('Wrote data', { path: relPath, mode });
    return `File user/${relPath} ${mode === 'append' ? 'updated' : 'saved'} successfully.`;
}