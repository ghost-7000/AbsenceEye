'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { seedDatabase } from '@/lib/supabase-seed';
import type { User, Teacher } from '@/lib/types';
import { revalidatePath } from 'next/cache';

type AuthRole = 'admin' | 'teacher';
type AuthInput = { email: string; password?: string; role: AuthRole; };
type UnifiedUser = Omit<User & Teacher, never> & { id: string };
type AuthResult = { success: boolean; message?: string; user?: UnifiedUser; };

export async function authenticate(credentials: AuthInput): Promise<AuthResult> {
  await seedDatabase();
  try {
    let userRow: any = null;
    if (credentials.role === 'admin') {
      const { data } = await supabaseAdmin.from('users').select('*').eq('email', credentials.email).maybeSingle();
      userRow = data;
    } else {
      const { data } = await supabaseAdmin.from('teachers').select('*').eq('email', credentials.email).maybeSingle();
      userRow = data;
    }

    if (!userRow) return { success: false, message: 'المستخدم غير موجود.' };
    if (userRow.password !== credentials.password) return { success: false, message: 'كلمة المرور غير صحيحة.' };

    const { password, avatar_url, ...rest } = userRow;
    return { success: true, user: { ...rest, avatarUrl: avatar_url || '', role: credentials.role } as UnifiedUser };
  } catch (error) {
    console.error('Auth error:', error);
    return { success: false, message: 'حدث خطأ في الخادم.' };
  }
}

export async function getUser(userId: string, role: AuthRole): Promise<UnifiedUser | null> {
  const table = role === 'admin' ? 'users' : 'teachers';
  const { data } = await supabaseAdmin.from(table).select('*').eq('id', userId).maybeSingle();
  if (!data) return null;
  const { password, avatar_url, ...rest } = data;
  return { ...rest, avatarUrl: avatar_url || '', role } as UnifiedUser;
}

type UpdatePayload = { name: string; email: string; avatarDataUrl?: string | null; };

export async function updateUser(userId: string, role: AuthRole, payload: UpdatePayload): Promise<UnifiedUser> {
  const { name, email, avatarDataUrl } = payload;
  const updateData: any = { name, email };
  if (avatarDataUrl) updateData.avatar_url = avatarDataUrl;
  const table = role === 'admin' ? 'users' : 'teachers';
  const { data } = await supabaseAdmin.from(table).update(updateData).eq('id', userId).select().single();
  if (!data) throw new Error('فشل تحديث المستخدم.');
  revalidatePath('/' + role + '/profile');
  const { password, avatar_url, ...rest } = data;
  return { ...rest, avatarUrl: avatar_url || '', role } as UnifiedUser;
}

export async function updatePassword(userId: string, role: AuthRole, password: string): Promise<{ success: boolean }> {
  const table = role === 'admin' ? 'users' : 'teachers';
  await supabaseAdmin.from(table).update({ password }).eq('id', userId);
  return { success: true };
}