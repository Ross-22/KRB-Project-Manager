import Database from 'better-sqlite3';
import path from 'path';

// Create or open the database file
const dbPath = path.resolve(process.cwd(), 'data.db');
const db = new Database(dbPath);

// Initialize database schema
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        color TEXT DEFAULT '#ffffff',
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
`);

// Try to add user_id column if tasks table already existed without it
try {
    // Cannot add a REFERENCES column with a non-NULL default directly in some SQLite versions.
    // Instead, we check if the column exists by PRAGMA, but catching the error is simpler.
    db.exec(`ALTER TABLE tasks ADD COLUMN user_id INTEGER REFERENCES users(id)`);
    // After adding the column (which defaults to NULL), update existing tasks to belong to a default user (id: 1)
    db.exec(`UPDATE tasks SET user_id = 1 WHERE user_id IS NULL`);
} catch (error: any) {
    // If column already exists, this throws an error. We can safely ignore it.
    if (!error.message.includes('duplicate column name')) {
        console.error('Failed to add user_id to tasks:', error);
    }
}

export default db;
