import { supabase } from '../lib/supabase';
import { CashFlow } from '../types';

export class SupabaseCashService {
  static async createCashFlow(cashFlowData: {
    user_id: string;
    user_name: string;
    type: 'entrada' | 'saida';
    amount: number;
    description: string;
    category?: string;
    date: string;
  }): Promise<CashFlow> {
    const { data, error } = await supabase
      .from('cash_flows')
      .insert([cashFlowData])
      .select()
      .single();

    if (error) throw error;
    return this.mapToCashFlow(data);
  }

  static async findAll(): Promise<CashFlow[]> {
    const { data, error } = await supabase
      .from('cash_flows')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(this.mapToCashFlow);
  }

  static async findById(id: string): Promise<CashFlow | null> {
    const { data, error } = await supabase
      .from('cash_flows')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.mapToCashFlow(data) : null;
  }

  static async updateCashFlow(id: string, updates: {
    type?: 'entrada' | 'saida';
    amount?: number;
    description?: string;
    category?: string;
    date?: string;
  }): Promise<CashFlow | null> {
    const { data, error } = await supabase
      .from('cash_flows')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapToCashFlow(data);
  }

  static async deleteCashFlow(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('cash_flows')
      .delete()
      .eq('id', id);

    return !error;
  }

  static async getCashFlowsByDateRange(startDate: Date, endDate: Date): Promise<CashFlow[]> {
    const { data, error } = await supabase
      .from('cash_flows')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (error) throw error;
    return data.map(this.mapToCashFlow);
  }

  static async getCashFlowsByUser(userId: string): Promise<CashFlow[]> {
    const { data, error } = await supabase
      .from('cash_flows')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(this.mapToCashFlow);
  }

  private static mapToCashFlow(data: any): CashFlow {
    return {
      id: data.id,
      userId: data.user_id,
      userName: data.user_name,
      type: data.type,
      amount: parseFloat(data.amount),
      description: data.description,
      category: data.category,
      date: new Date(data.date),
      createdAt: new Date(data.created_at),
    };
  }
}