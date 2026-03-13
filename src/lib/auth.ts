'use server';

import bcrypt from 'bcryptjs';
import db from './db';
import { createSession, deleteSession } from './session';
import { redirect } from 'next/navigation';

export async function signup(prevState: any, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { error: 'Username and password are required' };
  }

  // Check if username exists
  const existingUserResult = await db.execute({
    sql: 'SELECT id FROM users WHERE username = ?',
    args: [username]
  });
  
  if (existingUserResult.rows.length > 0) {
    return { error: 'Username already exists' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const insertResult = await db.execute({
    sql: 'INSERT INTO users (username, password) VALUES (?, ?) RETURNING id',
    args: [username, hashedPassword]
  });

  const userId = insertResult.rows[0].id as number;

  await createSession(userId, username);
  redirect('/');
}

export async function login(prevState: any, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { error: 'Username and password are required' };
  }

  const userResult = await db.execute({
    sql: 'SELECT id, password FROM users WHERE username = ?',
    args: [username]
  });

  if (userResult.rows.length === 0) {
    return { error: 'Invalid username or password' };
  }

  const user = userResult.rows[0];
  const isPasswordValid = await bcrypt.compare(password, user.password as string);

  if (!isPasswordValid) {
    return { error: 'Invalid username or password' };
  }

  await createSession(user.id as number, username);
  redirect('/');
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}
