
import { supabase } from '../supabase';
import type { AuthProvider, SessionUser } from './auth.types';
import type { User } from '@supabase/supabase-js';

function toSessionUser(user: User): SessionUser {
  const metadata = user.user_metadata ?? {};

  return {
    id: user.id,
    fullName:
      metadata.full_name ||
      [metadata.first_name, metadata.last_name]
        .filter(Boolean)
        .join(' ') ||
      'Talaba',
    role: 'student',
    status: 'approved',
    group: metadata.group_name || undefined,
  };
}

let currentUser: SessionUser | null = null;

export const supabaseAuthProvider: AuthProvider = {
  kind: 'server',

  getSession() {
    return currentUser;
  },

  async signIn(login: string, password: string) {
    const username = login.trim().toLowerCase();

    if (!username || !password) {
      throw new Error('Login va parolni kiriting.');
    }

    const email = `${username}@students.invalid`;

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error || !data.user) {
      throw new Error('Login yoki parol noto‘g‘ri.');
    }

    currentUser = toSessionUser(data.user);
    return currentUser;
  },

  async register() {
    throw new Error(
      'Ro‘yxatdan o‘tish uchun maxsus sahifadan foydalaning.'
    );
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }

    currentUser = null;
  },
};

export async function restoreSupabaseSession() {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    currentUser = null;
    return null;
  }

  currentUser = toSessionUser(data.user);
  return currentUser;
}
