import { supabase } from '../lib/supabase';
import { Client } from '../types';
import { Database } from '../types/database';

type DbClient = Database['public']['Tables']['clients']['Row'];
type InsertClient = Database['public']['Tables']['clients']['Insert'];
type UpdateClient = Database['public']['Tables']['clients']['Update'];

export class ClientService {
  static async createClient(clientData: Omit<InsertClient, 'id' | 'created_at' | 'updated_at'>): Promise<Client> {
    const { data, error } = await supabase
      .from('clients')
      .insert([clientData])
      .select()
      .single();

    if (error) throw error;
    return this.mapToClient(data);
  }

  static async findById(id: string): Promise<Client | null> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.mapToClient(data) : null;
  }

  static async findAll(): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(this.mapToClient);
  }

  static async searchClients(query: string): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .or(`nome.ilike.%${query}%,cpf.ilike.%${query}%,telefone.ilike.%${query}%,matricula.ilike.%${query}%,email.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(this.mapToClient);
  }

  static async updateClient(id: string, updates: UpdateClient): Promise<Client | null> {
    const { data, error } = await supabase
      .from('clients')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapToClient(data);
  }

  static async deleteClient(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    return !error;
  }

  static async getClientsByDateRange(startDate: Date, endDate: Date): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(this.mapToClient);
  }

  private static mapToClient(client: DbClient): Client {
    return {
      id: client.id,
      nome: client.nome,
      cpf: client.cpf,
      telefone: client.telefone,
      email: client.email,
      endereco: client.endereco,
      matricula: client.matricula,
      telefonesAdicionais: client.telefones_adicionais,
      observacoes: client.observacoes,
      createdAt: new Date(client.created_at),
      updatedAt: new Date(client.updated_at),
      createdBy: client.created_by || '',
      updatedBy: client.updated_by || '',
    };
  }
}