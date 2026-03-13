'use server';

import db from './db';
import { revalidatePath } from 'next/cache';
import { getSession } from './session';

export interface Task {
    id: number;
    user_id: number;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    status: string;
    color: string;
}

export interface CreateTaskInput {
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    status?: string;
    color?: string;
}

export async function getTasks(): Promise<Task[]> {
    const session = await getSession();
    if (!session) return [];

    // Automatically update tasks to 'delayed' if they are past their end_date 
    // and aren't already completed, cancelled, or delayed.
    const stmtUpdate = db.prepare(`
        UPDATE tasks 
        SET status = 'delayed' 
        WHERE status NOT IN ('completed', 'cancelled', 'delayed') 
        AND date(end_date) < date('now', 'localtime')
        AND user_id = ?
    `);
    stmtUpdate.run(session.userId);

    const stmt = db.prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY start_date ASC');
    return stmt.all(session.userId) as Task[];
}

export async function createTask(data: CreateTaskInput) {
    const session = await getSession();
    if (!session) return;

    const stmt = db.prepare(`
        INSERT INTO tasks (user_id, title, description, start_date, end_date, status, color)
        VALUES (@user_id, @title, @description, @start_date, @end_date, @status, @color)
    `);
    
    stmt.run({
        user_id: session.userId,
        title: data.title,
        description: data.description || '',
        start_date: data.start_date,
        end_date: data.end_date,
        status: data.status || 'pending',
        color: data.color || '#ffffff'
    });
    
    revalidatePath('/');
}

export async function updateTask(id: number, data: Partial<CreateTaskInput>) {
    const session = await getSession();
    if (!session) return;

    // Dynamically build the UPDATE query based on provided fields
    const fields: string[] = [];
    const values: any = { id, user_id: session.userId };
    
    for (const [key, value] of Object.entries(data)) {
        if (value !== undefined) {
            fields.push(`${key} = @${key}`);
            values[key] = value;
        }
    }
    
    if (fields.length === 0) return;
    
    const stmt = db.prepare(`
        UPDATE tasks SET ${fields.join(', ')} WHERE id = @id AND user_id = @user_id
    `);
    
    stmt.run(values);
    revalidatePath('/');
}

export async function deleteTask(id: number) {
    const session = await getSession();
    if (!session) return;

    const stmt = db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?');
    stmt.run(id, session.userId);
    revalidatePath('/');
}
