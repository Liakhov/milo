import Database, {Database as DbType, Statement} from 'better-sqlite3';
import fs from "fs";
import path from "path";

const DB_DIR = path.join(import.meta.dirname, "..", "db");
const DB_PATH = path.join(DB_DIR, "milo.db");

let db: DbType;

// Caching prepared queries for speedup
let insertMessageStmt: Statement;
let fetchMessagesStmt: Statement;

export async function initDb(): Promise<void> {
    fs.mkdirSync(DB_DIR, {recursive: true});

    db = new Database(DB_PATH);

    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = NORMAL');

    db.exec(`CREATE TABLE IF NOT EXISTS messages
             (
                 id         INTEGER PRIMARY KEY AUTOINCREMENT,
                 chat_id    INTEGER NOT NULL,
                 role       TEXT    NOT NULL CHECK (role IN ('user', 'assistant')),
                 content    TEXT    NOT NULL,
                 created_at TEXT DEFAULT (datetime('now'))
             );
    CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages (chat_id);
    `);

    insertMessageStmt = db.prepare('INSERT INTO messages (chat_id, role, content) VALUES (@chatId, @role, @content)');
    fetchMessagesStmt = db.prepare('SELECT role, content FROM messages WHERE chat_id = ? ORDER BY id DESC LIMIT ?');
}

export function saveMessage(chatId: number, role: "user" | "assistant", content: string) {
    insertMessageStmt.run({chatId, role, content});
}

export function getHistory(chatId: number, limit = 10): Array<{ role: "user" | "assistant"; content: string }> {
    const row = fetchMessagesStmt.all(chatId, limit).reverse();
    return row as Array<{ role: "user" | "assistant"; content: string }>;
}

export function closeDb(): void {
    db.close();
}
