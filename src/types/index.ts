// Tipos principais do sistema
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'administrador-all' | 'administrador' | 'funcionario';
  setor: 'adimplencia' | 'homologacao' | 'vendas' | 'recepcao' | 'geral';
  login: string;
  createdAt: Date;
  isActive: boolean;
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

export interface AuthContext {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

export type UserRole = User['role'];
export type Setor = User['setor'];