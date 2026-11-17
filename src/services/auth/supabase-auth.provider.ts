
import { supabase } from '../supabase';
import type { AuthProvider, SessionUser } from './auth.types';
import type { User } from '@supabase/supabase-js';

let currentUser: SessionUser | null = null;

async function toSessionUser(user: User): Promise<SessionUser> {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('first_name, last_name, group_id, role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    throw new Error(
      'Talaba profili yuklanmadi. Profil ruxsatlarini tekshiring.'
    );
  }

  let groupName: string | undefined;

  if (profile.group_id !== null) {
    const { data: group, error: groupError } = await supabase
      .from('student_groups')
      .select('name')
      .eq('id', profile.group_id)
      .single();

    if (groupError) {
      throw new Error('Guruh ma’lumotini yuklab bo‘lmadi.');
    }

    groupName = group?.name;
  }

  const fullName = [
    profile.first_name,
    profile.last_name,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  return {
    id: user.id,
    fullName: fullName || 'Talaba',
    role: profile.role === 'admin' ? 'admin' : 'student',
    status: 'approved',
    group: groupName,
  };
}

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

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      throw new Error('Login yoki parol noto‘g‘ri.');
    }

    try {
      currentUser = await toSessionUser(data.user);
      return currentUser;
    } catch (err) {
      currentUser = null;
      await supabase.auth.signOut();
      throw err;
    }
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

export async function restoreSupabaseSession(): Promise<SessionUser | null> {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    currentUser = null;
    return null;
  }

  try {
    currentUser = await toSessionUser(data.user);
    return currentUser;
  } catch (err) {
    console.error('Profilni tiklashda xatolik:', err);
    currentUser = null;
    return null;
  }
}
