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
    await db.execute({
        sql: `
            UPDATE tasks 
            SET status = 'delayed' 
            WHERE status NOT IN ('completed', 'cancelled', 'delayed') 
            AND date(end_date) < date('now', 'localtime')
            AND user_id = ?
        `,
        args: [session.userId]
    });

    const result = await db.execute({
        sql: 'SELECT * FROM tasks WHERE user_id = ? ORDER BY start_date ASC',
        args: [session.userId]
    });
    
    // Convert libSQL row format to Task objects
    return result.rows as unknown as Task[];
}

export async function createTask(data: CreateTaskInput) {
    const session = await getSession();
    if (!session) return;

    await db.execute({
        sql: `
            INSERT INTO tasks (user_id, title, description, start_date, end_date, status, color)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
            session.userId,
            data.title,
            data.description || '',
            data.start_date,
            data.end_date,
            data.status || 'pending',
            data.color || '#ffffff'
        ]
    });
    
    revalidatePath('/');
}

export async function updateTask(id: number, data: Partial<CreateTaskInput>) {
    const session = await getSession();
    if (!session) return;

    // Dynamically build the UPDATE query based on provided fields
    const fields: string[] = [];
    const values: any[] = [];
    
    for (const [key, value] of Object.entries(data)) {
        if (value !== undefined) {
            fields.push(`${key} = ?`);
            values.push(value);
        }
    }
    
    if (fields.length === 0) return;
    
    values.push(id);
    values.push(session.userId);

    await db.execute({
        sql: `UPDATE tasks SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
        args: values
    });
    
    revalidatePath('/');
}

export async function deleteTask(id: number) {
    const session = await getSession();
    if (!session) return;

    await db.execute({
        sql: 'DELETE FROM tasks WHERE id = ? AND user_id = ?',
        args: [id, session.userId]
    });
    
    revalidatePath('/');
}