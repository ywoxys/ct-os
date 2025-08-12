import { Client, User } from '../types';
import {
  getLocalUsers,
  setLocalUsers,
  getLocalClients,
  setLocalClients
} from '../utils/seedDatabase';

// Local User Service
export class LocalUserService {
  static async findByLoginOrEmail(loginOrEmail: string): Promise<User | null> {
    const users = getLocalUsers();
    const user = users.find(u =>
        (u.login === loginOrEmail || u.email === loginOrEmail) && u.isActive
    );
    return user || null;
  }

  static async findById(id: string): Promise<User | null> {
    const users = getLocalUsers();
    return users.find(u => u.id === id) || null;
  }

  static async findAll(): Promise<User[]> {
    return getLocalUsers().filter(u => u.isActive);
  }
}

// Local Client Service
export class LocalClientService {
  static async createClient(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    const clients = getLocalClients();
    const newClient: Client = {
      ...clientData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    clients.push(newClient);
    setLocalClients(clients);
    return newClient;
  }

  static async findById(id: string): Promise<Client | null> {
    const clients = getLocalClients();
    return clients.find(c => c.id === id) || null;
  }

  static async findAll(): Promise<Client[]> {
    return getLocalClients().sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  static async searchClients(query: string): Promise<Client[]> {
    const clients = getLocalClients();
    const searchTerm = query.toLowerCase();

    return clients.filter(client =>
        client.nome.toLowerCase().includes(searchTerm) ||
        client.cpf.includes(searchTerm) ||
        client.telefone.includes(searchTerm) ||
        (client.matricula && client.matricula.toLowerCase().includes(searchTerm)) ||
        (client.email && client.email.toLowerCase().includes(searchTerm))
    ).sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  static async updateClient(id: string, updates: Partial<Client>): Promise<Client | null> {
    const clients = getLocalClients();
    const index = clients.findIndex(c => c.id === id);

    if (index === -1) return null;

    const updatedClient = {
      ...clients[index],
      ...updates,
      updatedAt: new Date(),
    };

    clients[index] = updatedClient;
    setLocalClients(clients);
    return updatedClient;
  }

  static async deleteClient(id: string): Promise<boolean> {
    const clients = getLocalClients();
    const filteredClients = clients.filter(c => c.id !== id);

    if (filteredClients.length === clients.length) return false;

    setLocalClients(filteredClients);
    return true;
  }
}
