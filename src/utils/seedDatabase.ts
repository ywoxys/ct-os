import { UserService } from '../services/userService';
import { Client, User } from '../types';

// Local storage keys
const USERS_KEY = 'ct-users';
const CLIENTS_KEY = 'ct-clients';

// Demo data
const demoUsers: User[] = [
  {
    id: '1',
    name: 'Admin Principal',
    email: 'admin@sistemact.com',
    role: 'administrador-all',
    setor: 'geral',
    login: 'admin',
    createdAt: new Date(),
    isActive: true,
  },
  {
    id: '2',
    name: 'João Silva',
    email: 'joao@sistemact.com',
    role: 'administrador',
    setor: 'vendas',
    login: 'joao',
    createdAt: new Date(),
    isActive: true,
  },
  {
    id: '3',
    name: 'Maria Santos',
    email: 'maria@sistemact.com',
    role: 'funcionario',
    setor: 'recepcao',
    login: 'maria',
    createdAt: new Date(),
    isActive: true,
  },
];

const demoClients: Client[] = [
  {
    id: '1',
    nome: 'João da Silva',
    cpf: '123.456.789-00',
    telefone: '(11) 99999-9999',
    email: 'joao.silva@email.com',
    endereco: 'Rua das Flores, 123 - São Paulo, SP',
    matricula: 'MAT001',
    telefonesAdicionais: ['(11) 3333-3333'],
    observacoes: 'Cliente preferencial',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    createdBy: '1',
    updatedBy: '1',
  },
  {
    id: '2',
    nome: 'Maria Oliveira',
    cpf: '987.654.321-00',
    telefone: '(11) 88888-8888',
    email: 'maria.oliveira@email.com',
    endereco: 'Av. Paulista, 456 - São Paulo, SP',
    matricula: 'MAT002',
    telefonesAdicionais: [],
    observacoes: '',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    createdBy: '2',
    updatedBy: '2',
  },
  {
    id: '3',
    nome: 'Pedro Santos',
    cpf: '456.789.123-00',
    telefone: '(11) 77777-7777',
    email: 'pedro.santos@email.com',
    endereco: 'Rua Augusta, 789 - São Paulo, SP',
    matricula: 'MAT003',
    telefonesAdicionais: ['(11) 2222-2222', '(11) 4444-4444'],
    observacoes: 'Contato preferencial por WhatsApp',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    createdBy: '3',
    updatedBy: '3',
  },
];

// Local storage functions
export const getLocalUsers = (): User[] => {
  const stored = localStorage.getItem(USERS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const setLocalUsers = (users: User[]): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getLocalClients = (): Client[] => {
  const stored = localStorage.getItem(CLIENTS_KEY);
  if (stored) {
    const clients = JSON.parse(stored);
    return clients.map((client: any) => ({
      ...client,
      createdAt: new Date(client.createdAt),
      updatedAt: new Date(client.updatedAt),
    }));
  }
  return [];
};

export const setLocalClients = (clients: Client[]): void => {
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
};

export const seedLocalData = async () => {
  try {
    // Check if data already exists
    const existingUsers = getLocalUsers();
    if (existingUsers.length === 0) {
      console.log('Seeding local demo data...');
      setLocalUsers(demoUsers);
      setLocalClients(demoClients);

      // Add demo employees
      const demoEmployees = demoUsers.map(user => ({
        ...user,
        createdBy: '1',
        updatedBy: '1',
      }));
      localStorage.setItem('ct-employees', JSON.stringify(demoEmployees));

      // Add demo notifications
      const demoNotifications = [
        {
          id: '1',
          title: 'Bem-vindo ao Sistema CT!',
          message: 'Sistema inicializado com sucesso. Explore todas as funcionalidades disponíveis.',
          type: 'success',
          isRead: false,
          createdAt: new Date(),
        },
        {
          id: '2',
          title: 'Modo Demonstração',
          message: 'Você está usando o modo local. Configure o Supabase para usar o banco de dados completo.',
          type: 'info',
          isRead: false,
          createdAt: new Date(Date.now() - 5 * 60 * 1000),
        },
      ];
      localStorage.setItem('ct-notifications', JSON.stringify(demoNotifications));

      console.log('Local demo data seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding local data:', error);
  }
};

export const seedDatabase = async () => {
  try {
    // Check if demo users already exist
    const existingUsers = await UserService.findAll();
    if (existingUsers.length === 0) {
      console.log('Creating demo users...');

      const demoUsers = [
        {
          name: 'Admin Principal',
          email: 'admin@sistemact.com',
          role: 'administrador-all' as const,
          setor: 'geral' as const,
          login: 'admin',
          password: 'admin123',
          is_active: true,
        },
        {
          name: 'João Silva',
          email: 'joao@sistemact.com',
          role: 'administrador' as const,
          setor: 'vendas' as const,
          login: 'joao',
          password: 'joao123',
          is_active: true,
        },
        {
          name: 'Maria Santos',
          email: 'maria@sistemact.com',
          role: 'funcionario' as const,
          setor: 'recepcao' as const,
          login: 'maria',
          password: 'maria123',
          is_active: true,
        },
      ];
      for (const userData of demoUsers) {
        await UserService.createUser(userData);
      }

      console.log('Demo users created successfully');
    } else {
      console.log('Demo users already exist');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
