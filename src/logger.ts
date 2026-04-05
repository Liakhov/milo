import fs from 'fs';
import path from 'path';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
};

const COLORS: Record<LogLevel, string> = {
    debug: '\x1b[90m',  // gray
    info: '\x1b[36m',  // cyan
    warn: '\x1b[33m',  // yellow
    error: '\x1b[31m'  // red
};

const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

const minLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
const logsDir = path.join(import.meta.dirname, '..', 'logs');

function shouldLog(level: LogLevel): boolean {
    return LEVELS[level] >= LEVELS[minLevel];
}

function timestamp(): string {
    return new Date().toTimeString().slice(0, 8);
}

// --- Console format (human-readable, colored) ---

function formatConsole(level: LogLevel, module: string, message: string, data?: Record<string, unknown>): string {
    const color = COLORS[level];
    const ts = `${DIM}${timestamp()}${RESET}`;
    const tag = `${color}${level.toUpperCase().padEnd(5)}${RESET}`;
    const mod = `${DIM}${module.padEnd(7)}${RESET}`;
    const base = `${ts} ${tag} ${mod} ${message}`;

    if (!data) return base;

    const indent = ' '.repeat(23);
    const pairs = Object.entries(data)
      .map(([k, v]) => `${k}=${v}`)
      .join(' ');
    return `${base}\n${DIM}${indent}${pairs}${RESET}`;
}

// --- File format (JSONL, machine-readable) ---

function formatFile(level: LogLevel, module: string, message: string, data?: Record<string, unknown>): string {
    const entry: Record<string, unknown> = {
        ts: new Date().toISOString(),
        level,
        module,
        msg: message,
        ...data
    };
    return JSON.stringify(entry);
}

function getLogFilePath(): string {
    const date = new Date().toISOString().slice(0, 10);
    return path.join(logsDir, `${date}.jsonl`);
}

function writeToFile(line: string): void {
    try {
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }
        fs.appendFileSync(getLogFilePath(), line + '\n');
    } catch {
        // silent fail — don't break the app because of logging
    }
}

// --- Logger factory ---

function createLogger(module: string) {
    const emit = (level: LogLevel, msg: string, data?: Record<string, unknown>) => {
        // always write to file at debug level
        writeToFile(formatFile(level, module, msg, data));

        // console respects LOG_LEVEL
        if (!shouldLog(level)) return;
        const formatted = formatConsole(level, module, msg, data);
        switch (level) {
            case 'debug':
                console.debug(formatted);
                break;
            case 'info':
                console.info(formatted);
                break;
            case 'warn':
                console.warn(formatted);
                break;
            case 'error':
                console.error(formatted);
                break;
        }
    };

    return {
        debug: (msg: string, data?: Record<string, unknown>) => emit('debug', msg, data),
        info: (msg: string, data?: Record<string, unknown>) => emit('info', msg, data),
        warn: (msg: string, data?: Record<string, unknown>) => emit('warn', msg, data),
        error: (msg: string, data?: Record<string, unknown>) => emit('error', msg, data)
    };
}

export function logger(module: string) {
    return createLogger(module);
}
