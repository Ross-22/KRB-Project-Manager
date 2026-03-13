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
  const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  
  if (existingUser) {
    return { error: 'Username already exists' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
  const info = stmt.run(username, hashedPassword);

  await createSession(info.lastInsertRowid as number, username);
  redirect('/');
}

export async function login(prevState: any, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { error: 'Username and password are required' };
  }

  const user = db.prepare('SELECT id, password FROM users WHERE username = ?').get(username) as { id: number, password: string } | undefined;

  if (!user) {
    return { error: 'Invalid username or password' };
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return { error: 'Invalid username or password' };
  }

  await createSession(user.id, username);
  redirect('/');
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}
