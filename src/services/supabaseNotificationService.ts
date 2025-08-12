import { supabase } from '../lib/supabase';
import { Notification } from '../types';

export class SupabaseNotificationService {
  static async createNotification(notificationData: {
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    user_id?: string;
    expires_at?: string;
  }): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single();

    if (error) throw error;
    return this.mapToNotification(data);
  }

  static async findByUserId(userId?: string): Promise<Notification[]> {
    let query = supabase
      .from('notifications')
      .select('*');

    if (userId) {
      query = query.or(`user_id.is.null,user_id.eq.${userId}`);
    } else {
      query = query.is('user_id', null);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(this.mapToNotification);
  }

  static async markAsRead(id: string): Promise<Notification | null> {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapToNotification(data);
  }

  static async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId);

    if (error) throw error;
  }

  static async deleteNotification(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    return !error;
  }

  static async deleteExpired(): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (error) throw error;
  }

  private static mapToNotification(data: any): Notification {
    return {
      id: data.id,
      title: data.title,
      message: data.message,
      type: data.type,
      userId: data.user_id,
      isRead: data.is_read,
      createdAt: new Date(data.created_at),
      expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
    };
  }
}