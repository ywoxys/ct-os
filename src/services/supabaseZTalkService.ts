import { supabase } from '../lib/supabase';
import { ZTalkContact, ZTalkConversation, ZTalkMessage, ZTalkQueue, ZTalkBroadcast } from '../types';

export class SupabaseZTalkService {
  // Contact methods
  static async createContact(contactData: {
    name: string;
    phone: string;
    email?: string;
    tags?: string[];
    status?: 'active' | 'blocked' | 'inactive';
  }): Promise<ZTalkContact> {
    const { data, error } = await supabase
      .from('ztalk_contacts')
      .insert([contactData])
      .select()
      .single();

    if (error) throw error;
    return this.mapToContact(data);
  }

  static async findAllContacts(): Promise<ZTalkContact[]> {
    const { data, error } = await supabase
      .from('ztalk_contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(this.mapToContact);
  }

  static async updateContact(id: string, updates: {
    name?: string;
    phone?: string;
    email?: string;
    tags?: string[];
    status?: 'active' | 'blocked' | 'inactive';
    last_interaction?: string;
  }): Promise<ZTalkContact | null> {
    const { data, error } = await supabase
      .from('ztalk_contacts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapToContact(data);
  }

  static async deleteContact(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('ztalk_contacts')
      .delete()
      .eq('id', id);

    return !error;
  }

  // Conversation methods
  static async createConversation(conversationData: {
    contact_id: string;
    contact_name: string;
    contact_phone: string;
    assigned_to?: string;
    assigned_to_name?: string;
    status?: 'open' | 'closed' | 'pending' | 'in_progress';
    priority?: 'low' | 'medium' | 'high';
    tags?: string[];
  }): Promise<ZTalkConversation> {
    const { data, error } = await supabase
      .from('ztalk_conversations')
      .insert([conversationData])
      .select()
      .single();

    if (error) throw error;
    return this.mapToConversation(data);
  }

  static async findAllConversations(): Promise<ZTalkConversation[]> {
    const { data, error } = await supabase
      .from('ztalk_conversations')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data.map(this.mapToConversation);
  }

  static async updateConversation(id: string, updates: {
    assigned_to?: string;
    assigned_to_name?: string;
    status?: 'open' | 'closed' | 'pending' | 'in_progress';
    priority?: 'low' | 'medium' | 'high';
    tags?: string[];
    last_message?: string;
    last_message_at?: string;
  }): Promise<ZTalkConversation | null> {
    const { data, error } = await supabase
      .from('ztalk_conversations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapToConversation(data);
  }

  // Message methods
  static async createMessage(messageData: {
    conversation_id: string;
    sender_id: string;
    sender_name: string;
    message: string;
    type?: 'text' | 'image' | 'document' | 'audio';
    direction: 'inbound' | 'outbound';
    status?: 'sent' | 'delivered' | 'read' | 'failed';
  }): Promise<ZTalkMessage> {
    const { data, error } = await supabase
      .from('ztalk_messages')
      .insert([messageData])
      .select()
      .single();

    if (error) throw error;
    return this.mapToMessage(data);
  }

  static async findMessagesByConversation(conversationId: string): Promise<ZTalkMessage[]> {
    const { data, error } = await supabase
      .from('ztalk_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return data.map(this.mapToMessage);
  }

  // Queue methods
  static async createQueue(queueData: {
    name: string;
    description?: string;
    members?: string[];
    auto_assign?: boolean;
    max_conversations?: number;
    working_hours?: any;
    is_active?: boolean;
  }): Promise<ZTalkQueue> {
    const { data, error } = await supabase
      .from('ztalk_queues')
      .insert([queueData])
      .select()
      .single();

    if (error) throw error;
    return this.mapToQueue(data);
  }

  static async findAllQueues(): Promise<ZTalkQueue[]> {
    const { data, error } = await supabase
      .from('ztalk_queues')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data.map(this.mapToQueue);
  }

  static async updateQueue(id: string, updates: {
    name?: string;
    description?: string;
    members?: string[];
    auto_assign?: boolean;
    max_conversations?: number;
    working_hours?: any;
    is_active?: boolean;
  }): Promise<ZTalkQueue | null> {
    const { data, error } = await supabase
      .from('ztalk_queues')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapToQueue(data);
  }

  static async deleteQueue(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('ztalk_queues')
      .delete()
      .eq('id', id);

    return !error;
  }

  // Broadcast methods
  static async createBroadcast(broadcastData: {
    title: string;
    message: string;
    recipients: string[];
    scheduled_for?: string;
    status?: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
    created_by: string;
    stats?: any;
  }): Promise<ZTalkBroadcast> {
    const { data, error } = await supabase
      .from('ztalk_broadcasts')
      .insert([broadcastData])
      .select()
      .single();

    if (error) throw error;
    return this.mapToBroadcast(data);
  }

  static async findAllBroadcasts(): Promise<ZTalkBroadcast[]> {
    const { data, error } = await supabase
      .from('ztalk_broadcasts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(this.mapToBroadcast);
  }

  static async updateBroadcast(id: string, updates: {
    status?: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
    sent_at?: string;
    stats?: any;
  }): Promise<ZTalkBroadcast | null> {
    const { data, error } = await supabase
      .from('ztalk_broadcasts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapToBroadcast(data);
  }

  // Mapping methods
  private static mapToContact(data: any): ZTalkContact {
    return {
      id: data.id,
      name: data.name,
      phone: data.phone,
      email: data.email,
      tags: data.tags || [],
      lastInteraction: data.last_interaction ? new Date(data.last_interaction) : undefined,
      status: data.status,
    };
  }

  private static mapToConversation(data: any): ZTalkConversation {
    return {
      id: data.id,
      contactId: data.contact_id,
      contactName: data.contact_name,
      contactPhone: data.contact_phone,
      assignedTo: data.assigned_to,
      assignedToName: data.assigned_to_name,
      status: data.status,
      priority: data.priority,
      tags: data.tags || [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      lastMessage: data.last_message,
      lastMessageAt: data.last_message_at ? new Date(data.last_message_at) : undefined,
    };
  }

  private static mapToMessage(data: any): ZTalkMessage {
    return {
      id: data.id,
      conversationId: data.conversation_id,
      senderId: data.sender_id,
      senderName: data.sender_name,
      message: data.message,
      type: data.type,
      direction: data.direction,
      timestamp: new Date(data.timestamp),
      status: data.status,
    };
  }

  private static mapToQueue(data: any): ZTalkQueue {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      members: data.members || [],
      autoAssign: data.auto_assign,
      maxConversations: data.max_conversations,
      workingHours: data.working_hours,
      isActive: data.is_active,
    };
  }

  private static mapToBroadcast(data: any): ZTalkBroadcast {
    return {
      id: data.id,
      title: data.title,
      message: data.message,
      recipients: data.recipients || [],
      scheduledFor: data.scheduled_for ? new Date(data.scheduled_for) : undefined,
      status: data.status,
      createdBy: data.created_by,
      createdAt: new Date(data.created_at),
      sentAt: data.sent_at ? new Date(data.sent_at) : undefined,
      stats: data.stats || { sent: 0, delivered: 0, read: 0, failed: 0 },
    };
  }
}