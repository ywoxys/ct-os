import { supabase } from '../lib/supabase';
import { ChatMessage, ChatChannel } from '../types';

export class SupabaseChatService {
  // Channel methods
  static async createChannel(channelData: {
    name: string;
    description?: string;
    type: 'public' | 'private';
    members: string[];
    created_by: string;
  }): Promise<ChatChannel> {
    const { data, error } = await supabase
      .from('chat_channels')
      .insert([channelData])
      .select()
      .single();

    if (error) throw error;
    return this.mapToChannel(data);
  }

  static async findAllChannels(): Promise<ChatChannel[]> {
    const { data, error } = await supabase
      .from('chat_channels')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(this.mapToChannel);
  }

  static async updateChannel(id: string, updates: {
    name?: string;
    description?: string;
    members?: string[];
  }): Promise<ChatChannel | null> {
    const { data, error } = await supabase
      .from('chat_channels')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapToChannel(data);
  }

  // Message methods
  static async createMessage(messageData: {
    sender_id: string;
    sender_name: string;
    receiver_id?: string;
    receiver_name?: string;
    message: string;
    type: 'private' | 'group' | 'broadcast';
    channel_id?: string;
  }): Promise<ChatMessage> {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([messageData])
      .select()
      .single();

    if (error) throw error;
    return this.mapToMessage(data);
  }

  static async findMessagesByChannel(channelId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('channel_id', channelId)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return data.map(this.mapToMessage);
  }

  static async findPrivateMessages(userId1: string, userId2: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return data.map(this.mapToMessage);
  }

  static async markMessageAsRead(id: string): Promise<ChatMessage | null> {
    const { data, error } = await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapToMessage(data);
  }

  static async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .neq('sender_id', userId)
      .eq('is_read', false)
      .or(`receiver_id.eq.${userId},channel_id.is.not.null`);

    if (error) throw error;
    return count || 0;
  }

  private static mapToChannel(data: any): ChatChannel {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      type: data.type,
      members: data.members || [],
      createdBy: data.created_by,
      createdAt: new Date(data.created_at),
    };
  }

  private static mapToMessage(data: any): ChatMessage {
    return {
      id: data.id,
      senderId: data.sender_id,
      senderName: data.sender_name,
      receiverId: data.receiver_id,
      receiverName: data.receiver_name,
      message: data.message,
      type: data.type,
      channelId: data.channel_id,
      timestamp: new Date(data.timestamp),
      isRead: data.is_read,
    };
  }
}