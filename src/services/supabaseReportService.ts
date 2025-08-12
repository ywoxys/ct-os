import { supabase } from '../lib/supabase';
import { Report } from '../types';

export class SupabaseReportService {
  static async createReport(reportData: {
    title: string;
    type: 'clients' | 'cash' | 'employees' | 'ztalk' | 'general';
    data: any;
    generated_by: string;
    period_start: string;
    period_end: string;
    filters?: any;
  }): Promise<Report> {
    const { data, error } = await supabase
      .from('reports')
      .insert([reportData])
      .select()
      .single();

    if (error) throw error;
    return this.mapToReport(data);
  }

  static async findAll(): Promise<Report[]> {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('generated_at', { ascending: false });

    if (error) throw error;
    return data.map(this.mapToReport);
  }

  static async findByType(type: 'clients' | 'cash' | 'employees' | 'ztalk' | 'general'): Promise<Report[]> {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('type', type)
      .order('generated_at', { ascending: false });

    if (error) throw error;
    return data.map(this.mapToReport);
  }

  static async findByUser(userId: string): Promise<Report[]> {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('generated_by', userId)
      .order('generated_at', { ascending: false });

    if (error) throw error;
    return data.map(this.mapToReport);
  }

  static async findByDateRange(startDate: Date, endDate: Date): Promise<Report[]> {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .gte('generated_at', startDate.toISOString())
      .lte('generated_at', endDate.toISOString())
      .order('generated_at', { ascending: false });

    if (error) throw error;
    return data.map(this.mapToReport);
  }

  static async deleteReport(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', id);

    return !error;
  }

  private static mapToReport(data: any): Report {
    return {
      id: data.id,
      title: data.title,
      type: data.type,
      data: data.data,
      generatedBy: data.generated_by,
      generatedAt: new Date(data.generated_at),
      period: {
        start: new Date(data.period_start),
        end: new Date(data.period_end),
      },
    };
  }
}