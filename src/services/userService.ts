import { supabase } from '../lib/supabase';
import { User } from '../types';
import { Database } from '../types/database';

type DbUser = Database['public']['Tables']['users']['Row'];
type InsertUser = Database['public']['Tables']['users']['Insert'];
type UpdateUser = Database['public']['Tables']['users']['Update'];

export class UserService {
  static async createUser(userData: Omit<InsertUser, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) throw error;
    return this.mapToUser(data);
  }

  static async findByLoginOrEmail(loginOrEmail: string): Promise<DbUser | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`login.eq.${loginOrEmail},email.eq.${loginOrEmail}`)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  static async findById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.mapToUser(data) : null;
  }

  static async findAll(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(this.mapToUser);
  }

  static async updateUser(id: string, updates: UpdateUser): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapToUser(data);
  }

  static async deleteUser(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .update({ is_active: false })
      .eq('id', id);

    return !error;
  }

  private static mapToUser(user: DbUser): User {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      setor: user.setor,
      login: user.login,
      createdAt: new Date(user.created_at),
      isActive: user.is_active,
    };
  }
}