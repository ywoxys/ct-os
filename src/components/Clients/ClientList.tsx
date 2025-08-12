import React, { useState } from 'react';
import { Edit, Eye, Trash, Phone, Mail, MapPin } from 'lucide-react';
import { Client } from '../../types';
import { useClients } from '../../contexts/ClientContext';
import { useAuth } from '../../contexts/AuthContext';

interface ClientListProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onView: (client: Client) => void;
}

const ClientList: React.FC<ClientListProps> = ({ clients, onEdit, onView }) => {
  const { deleteClient } = useClients();
  const { user } = useAuth();
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  const canEdit = user?.role === 'administrador-all' || user?.role === 'administrador';
  const canDelete = user?.role === 'administrador-all';

  const handleDelete = (clientId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.')) {
      deleteClient(clientId);
      setClientToDelete(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  };

  if (clients.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Phone className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum cliente encontrado</h3>
        <p className="text-gray-500">Comece cadastrando seu primeiro cliente.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {clients.map((client) => (
        <div key={client.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {client.nome}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">CPF: {client.cpf}</p>
                {client.matricula && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">Matrícula: {client.matricula}</p>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onView(client)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                  title="Visualizar"
                >
                  <Eye className="w-4 h-4" />
                </button>
                {canEdit && (
                  <button
                    onClick={() => onEdit(client)}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => handleDelete(client.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Phone className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                {client.telefone}
              </div>

              {client.email && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Mail className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                  {client.email}
                </div>
              )}

              {client.endereco && (
                <div className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{client.endereco}</span>
                </div>
              )}

              {client.telefonesAdicionais && client.telefonesAdicionais.length > 0 && (
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Telefones adicionais:</p>
                  <div className="space-y-1">
                    {client.telefonesAdicionais.map((telefone, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Phone className="w-3 h-3 mr-2 text-gray-400 dark:text-gray-500" />
                        {telefone}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Criado em {formatDate(client.createdAt)}
              </span>
              {client.updatedAt > client.createdAt && (
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  Atualizado em {formatDate(client.updatedAt)}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClientList;