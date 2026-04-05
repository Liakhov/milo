type LogLevel = "debug" | "info" | "warn" | "error";

const LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

const COLORS: Record<LogLevel, string> = {
    debug: "\x1b[90m",  // gray
    info:  "\x1b[36m",  // cyan
    warn:  "\x1b[33m",  // yellow
    error: "\x1b[31m",  // red
};

const DIM   = "\x1b[2m";
const RESET = "\x1b[0m";

const minLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || "info";

function shouldLog(level: LogLevel): boolean {
    return LEVELS[level] >= LEVELS[minLevel];
}

function timestamp(): string {
    return new Date().toTimeString().slice(0, 8);
}

function format(level: LogLevel, module: string, message: string, data?: unknown): string {
    const color = COLORS[level];
    const ts = `${DIM}${timestamp()}${RESET}`;
    const tag = `${color}${level.toUpperCase().padEnd(5)}${RESET}`;
    const mod = `${DIM}${module.padEnd(7)}${RESET}`;
    const base = `${ts} ${tag} ${mod} ${message}`;

    if (data === undefined) return base;

    // indent to align with message text: "HH:MM:SS LEVEL module  " = 8+1+5+1+7+1 = 23 chars
    const indent = " ".repeat(23);
    if (data instanceof Error) return `${base}\n${DIM}${indent}${data.message}${RESET}`;

    const pairs = Object.entries(data as Record<string, unknown>)
        .map(([k, v]) => `${k}=${v}`)
        .join(" ");
    return `${base}\n${DIM}${indent}${pairs}${RESET}`;
}

function createLogger(module: string) {
    return {
        debug: (msg: string, data?: unknown) => {
            if (shouldLog("debug")) console.debug(format("debug", module, msg, data));
        },
        info: (msg: string, data?: unknown) => {
            if (shouldLog("info")) console.info(format("info", module, msg, data));
        },
        warn: (msg: string, data?: unknown) => {
            if (shouldLog("warn")) console.warn(format("warn", module, msg, data));
        },
        error: (msg: string, data?: unknown) => {
            if (shouldLog("error")) console.error(format("error", module, msg, data));
        },
    };
}

export const log = createLogger("milo");

export function logger(module: string) {
    return createLogger(module);
}