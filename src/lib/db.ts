import { createClient } from '@libsql/client';

// For local development, this will use local data.db file if env variables are missing.
// For Vercel, you need to add TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in the dashboard.
const dbUrl = process.env.TURSO_DATABASE_URL || 'file:data.db';

const db = createClient({
    url: dbUrl,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

// Initialize database schema (using executeBatch for multiple statements)
// Note: It's better to run migrations in a separate script for production, 
// but for this personal project we'll run it on initialization.
db.executeMultiple(`
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
`).catch((err) => {
    console.error('Failed to initialize database tables:', err);
});

// Try to add user_id column if tasks table already existed without it
// and assign orphaned tasks to a default user.
async function alterTable() {
    try {
        await db.execute('ALTER TABLE tasks ADD COLUMN user_id INTEGER REFERENCES users(id)');
        await db.execute('UPDATE tasks SET user_id = 1 WHERE user_id IS NULL');
    } catch (error: any) {
        // Safe to ignore duplicate column errors
        if (!error.message?.includes('duplicate column name')) {
            // Ignore other alter table errors gracefully
        }
    }
}
alterTable();

export default db;