import { supabase } from '../lib/supabase';
import { db } from './database';
import type { User } from '../types';

export const auth = {
  async signUp(email: string, password: string, userData: { name: string; role: string; storeId?: string }) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Failed to create user');

    const user = await db.users.create({
      email,
      name: userData.name,
      role: userData.role as 'admin' | 'manager' | 'cashier',
      storeId: userData.storeId,
      isActive: true,
      lastLogin: new Date().toISOString(),
    });

    return { authUser: authData.user, user };
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('Failed to sign in');

    const user = await db.users.getByEmail(email);
    if (!user) throw new Error('User not found in database');

    await db.users.update(user.id, {
      lastLogin: new Date().toISOString(),
    });

    return { authUser: data.user, user, session: data.session };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) return null;

    const user = await db.users.getByEmail(authUser.email!);
    return user;
  },

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        if (session?.user) {
          const user = await db.users.getByEmail(session.user.email!);
          callback(user);
        } else {
          callback(null);
        }
      })();
    });
  }
};
