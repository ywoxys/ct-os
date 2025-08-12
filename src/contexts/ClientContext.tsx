import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Client } from '../types';
import { useAuth } from './AuthContext';
import { ClientService } from '../services/clientService';
import { LocalClientService } from '../services/localStorageService';
import { useDatabase } from '../hooks/useDatabase';

interface ClientContextType {
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  searchClients: (query: string) => Promise<Client[]>;
}

const ClientContext = createContext<ClientContextType | null>(null);

interface ClientProviderProps {
  children: ReactNode;
}

export const ClientProvider: React.FC<ClientProviderProps> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { isConnected, useLocalMode } = useDatabase();

  useEffect(() => {
    const loadData = async () => {
      if (isConnected) {
        try {
          let clientsData;

          if (useLocalMode) {
            clientsData = await LocalClientService.findAll();
          } else {
            clientsData = await ClientService.findAll();
          }

          setClients(clientsData);
        } catch (error) {
          console.error('Error loading clients:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadData();
  }, [isConnected, useLocalMode]);

  const refreshData = async () => {
    if (isConnected) {
      try {
        let clientsData;

        if (useLocalMode) {
          clientsData = await LocalClientService.findAll();
        } else {
          clientsData = await ClientService.findAll();
        }

        setClients(clientsData);
      } catch (error) {
        console.error('Error refreshing clients:', error);
      }
    }
  };

  const addClient = async (
      clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>,
  ) => {
    if (!user || !isConnected) return;

    try {
      const { telefonesAdicionais, ...restClientData } = clientData;

      const newClientData = {
        ...restClientData,
        telefones_adicionais: telefonesAdicionais,
        created_by: user.id,
        updated_by: user.id,
      };

      let newClient;
      if (useLocalMode) {
        newClient = await LocalClientService.createClient(clientData);
      } else {
        newClient = await ClientService.createClient(newClientData);
      }

      await refreshData();
    } catch (error) {
      console.error('Error adding client:', error);
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    if (!user || !isConnected) return;

    try {
      let oldClient;
      if (useLocalMode) {
        oldClient = await LocalClientService.findById(id);
      } else {
        oldClient = await ClientService.findById(id);
      }

      if (!oldClient) return;

      let updatedClient;
      if (useLocalMode) {
        const updateData = {
          ...updates,
          updatedBy: user.id,
        };
        updatedClient = await LocalClientService.updateClient(id, updateData);
      } else {
        const { telefonesAdicionais, ...restUpdates } = updates;

        const updateData = {
          ...restUpdates,
          telefones_adicionais: telefonesAdicionais,
          updated_by: user.id,
        };
        updatedClient = await ClientService.updateClient(id, updateData);
      }

      if (updatedClient) {
        await refreshData();
      }
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  const deleteClient = async (id: string) => {
    if (!user || !isConnected) return;

    try {
      let clientToDelete;
      if (useLocalMode) {
        clientToDelete = await LocalClientService.findById(id);
      } else {
        clientToDelete = await ClientService.findById(id);
      }

      if (!clientToDelete) return;

      if (useLocalMode) {
        await LocalClientService.deleteClient(id);
      } else {
        await ClientService.deleteClient(id);
      }

      await refreshData();
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  const searchClients = async (query: string): Promise<Client[]> => {
    if (!isConnected) return [];

    try {
      if (!query.trim()) return clients;

      if (useLocalMode) {
        return await LocalClientService.searchClients(query);
      } else {
        return await ClientService.searchClients(query);
      }
    } catch (error) {
      console.error('Error searching clients:', error);
      return [];
    }
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando dados...</p>
          </div>
        </div>
    );
  }

  const value: ClientContextType = {
    clients,
    addClient,
    updateClient,
    deleteClient,
    searchClients,
  };

  return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>;
};

export const useClients = () => {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error('useClients deve ser usado dentro de um ClientProvider');
  }
  return context;
};
