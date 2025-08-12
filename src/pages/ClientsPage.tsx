import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useClients } from '../contexts/ClientContext';
import { useAuth } from '../contexts/AuthContext';
import ClientList from '../components/Clients/ClientList';
import ClientForm from '../components/Clients/ClientForm';
import ClientView from '../components/Clients/ClientView';
import { Client } from '../types';

const ClientsPage: React.FC = () => {
  const { clients, searchClients } = useClients();
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const filteredClients = searchQuery ? searchResults : clients;

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setIsSearching(true);
      try {
        const results = await searchClients(query);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleAddClient = () => {
    setSelectedClient(null);
    setShowForm(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setShowForm(true);
  };

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setShowView(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedClient(null);
  };

  const handleCloseView = () => {
    setShowView(false);
    setSelectedClient(null);
  };

  const handleSave = () => {
    // Refresh is handled by context
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600">Gerencie todos os clientes do sistema</p>
        </div>

        <button
          onClick={handleAddClient}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Cliente</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nome, CPF, telefone ou matrícula..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{clients.length}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400 text-sm">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Encontrados</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredClients.length}</p>
            </div>
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <span className="text-green-600 dark:text-green-400 text-sm">🔍</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Esta semana</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {clients.filter(c => {
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return new Date(c.createdAt) > weekAgo;
                }).length}
              </p>
            </div>
            <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 dark:text-yellow-400 text-sm">📈</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Setor</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{user?.setor}</p>
            </div>
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
              <span className="text-purple-600 dark:text-purple-400 text-sm">🏢</span>
            </div>
          </div>
        </div>
      </div>

      {/* Client List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <ClientList
          clients={filteredClients}
          onEdit={handleEditClient}
          onView={handleViewClient}
        />
      </div>

      {/* Modals */}
      {showForm && (
        <ClientForm
          client={selectedClient || undefined}
          onClose={handleCloseForm}
          onSave={handleSave}
        />
      )}

      {showView && selectedClient && (
        <ClientView
          client={selectedClient}
          onClose={handleCloseView}
          onEdit={() => {
            setShowView(false);
            setShowForm(true);
          }}
        />
      )}
    </div>
  );
};

export default ClientsPage;