import { supabase } from '../lib/supabase';
import { User } from '../types';

export const authService = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*, stores(*)')
        .eq('auth_user_id', data.user.id)
        .single();

      if (userError) throw userError;
      return userData;
    }

    return null;
  },

  async signUp(email: string, password: string, userData: Partial<User>) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    if (authData.user) {
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          auth_user_id: authData.user.id,
          email,
          name: userData.name,
          role: userData.role || 'cashier',
          store_id: userData.storeId,
          is_active: true,
        })
        .select()
        .single();

      if (userError) throw userError;
      return newUser;
    }

    return null;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*, stores(*)')
      .eq('auth_user_id', user.id)
      .single();

    if (error) throw error;
    return data;
  },

  async updateLastLogin(userId: string) {
    const { error } = await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userId);

    if (error) console.error('Failed to update last login:', error);
  },

  async createSession(userId: string, storeId: string, ipAddress?: string) {
    const { data, error } = await supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        store_id: storeId,
        ip_address: ipAddress,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async endSession(sessionId: string) {
    const { error } = await supabase
      .from('user_sessions')
      .update({
        logout_time: new Date().toISOString(),
        is_active: false
      })
      .eq('id', sessionId);

    if (error) console.error('Failed to end session:', error);
  }
};
