import initSqlJs, { Database } from "sql.js";
import fs from "fs";
import path from "path";

const DB_DIR = path.join(import.meta.dirname, "..", "db");
const DB_PATH = path.join(DB_DIR, "milo.db");

let db: Database;

export async function initDb() {
    fs.mkdirSync(DB_DIR, { recursive: true });
    const SQL = await initSqlJs();

    if (fs.existsSync(DB_PATH)) {
        const buffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(buffer);
    } else {
        db = new SQL.Database();
    }

    db.run(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            chat_id INTEGER NOT NULL,
            role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
            content TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        )
    `);

    save();
}

function save() {
    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
}

export function saveMessage(chatId: number, role: "user" | "assistant", content: string) {
    db.run(
        "INSERT INTO messages (chat_id, role, content) VALUES (?, ?, ?)",
        [chatId, role, content]
    );
}

export function flush() {
    save();
}

export function getHistory(chatId: number, limit = 10): Array<{ role: "user" | "assistant"; content: string }> {
    const stmt = db.prepare(
        "SELECT role, content FROM messages WHERE chat_id = ? ORDER BY id DESC LIMIT ?",
        [chatId, limit]
    );

    const rows: Array<{ role: "user" | "assistant"; content: string }> = [];
    while (stmt.step()) {
        const row = stmt.getAsObject() as { role: "user" | "assistant"; content: string };
        rows.push(row);
    }
    stmt.free();

    return rows.reverse();
}

export function closeDb() {
    save();
    db.close();
}
