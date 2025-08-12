// Tipos principais do sistema
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'administrador-all' | 'administrador' | 'funcionario' | 'whatsapp';
  setor: 'adimplencia' | 'homologacao' | 'vendas' | 'recepcao' | 'geral';
  login: string;
  createdAt: Date;
  isActive: boolean;
  password?: string; // Opcional para não quebrar outras partes
}

export interface Client {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email?: string;
  endereco?: string;
  matricula?: string;
  telefonesAdicionais?: string[];
  observacoes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface HistoryRecord {
  id: string;
  clientId: string;
  userId: string;
  userName: string;
  action: string;
  description: string;
  oldData?: any;
  newData?: any;
  timestamp: Date;
  type: 'automatic' | 'manual';
}

export interface CashFlow {
  id: string;
  userId: string;
  userName: string;
  type: 'entrada' | 'saida';
  amount: number;
  description: string;
  date: Date;
  category?: string;
  createdAt: Date;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  setor: Setor;
  login: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  userId?: string;
  isRead: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId?: string;
  receiverName?: string;
  message: string;
  type: 'private' | 'group' | 'broadcast';
  channelId?: string;
  timestamp: Date;
  isRead: boolean;
  attachments?: ChatAttachment[];
}

export interface ChatAttachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document' | 'audio';
  size: number;
}

export interface ChatChannel {
  id: string;
  name: string;
  description?: string;
  type: 'public' | 'private';
  members: string[];
  createdBy: string;
  createdAt: Date;
}

export interface Report {
  id: string;
  title: string;
  type: 'clients' | 'cash' | 'employees' | 'ztalk';
  data: any;
  generatedBy: string;
  generatedAt: Date;
  period: {
    start: Date;
    end: Date;
  };
}

export interface ZTalkContact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  tags: string[];
  lastInteraction?: Date;
  status: 'active' | 'blocked' | 'inactive';
}

export interface ZTalkConversation {
  id: string;
  contactId: string;
  contactName: string;
  contactPhone: string;
  assignedTo?: string;
  assignedToName?: string;
  status: 'open' | 'closed' | 'pending' | 'in_progress';
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: string;
  lastMessageAt?: Date;
}

export interface ZTalkMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  message: string;
  type: 'text' | 'image' | 'document' | 'audio';
  direction: 'inbound' | 'outbound';
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

export interface ZTalkQueue {
  id: string;
  name: string;
  description?: string;
  members: string[];
  autoAssign: boolean;
  maxConversations: number;
  workingHours: {
    start: string;
    end: string;
    days: number[];
  };
  isActive: boolean;
}

export interface ZTalkBroadcast {
  id: string;
  title: string;
  message: string;
  recipients: string[];
  scheduledFor?: Date;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  createdBy: string;
  createdAt: Date;
  sentAt?: Date;
  stats: {
    sent: number;
    delivered: number;
    read: number;
    failed: number;
  };
}

export interface AuthContext {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

export type UserRole = User['role'];
export type Setor = User['setor'];