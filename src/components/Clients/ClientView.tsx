import React from 'react';
import { X, Phone, Mail, MapPin, User, Calendar, Edit } from 'lucide-react';
import { Client } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from '../../utils/dateUtils';

interface ClientViewProps {
  client: Client;
  onClose: () => void;
  onEdit: () => void;
}

const ClientView: React.FC<ClientViewProps> = ({ client, onClose, onEdit }) => {
  const { user } = useAuth();

  const canEdit = user?.role === 'administrador-all' || user?.role === 'administrador';

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'criação':
        return 'bg-green-100 text-green-800';
      case 'atualização':
        return 'bg-blue-100 text-blue-800';
      case 'exclusão':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Detalhes do Cliente
            </h2>
            <div className="flex space-x-2">
              {canEdit && (
                  <button
                      onClick={onEdit}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
              )}
              <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informações do Cliente */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{client.nome}</h3>
                    <p className="text-gray-600">CPF: {client.cpf}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-5 h-5 mr-3 text-gray-400" />
                      <span>{client.telefone}</span>
                    </div>

                    {client.email && (
                        <div className="flex items-center text-gray-600">
                          <Mail className="w-5 h-5 mr-3 text-gray-400" />
                          <span>{client.email}</span>
                        </div>
                    )}

                    {client.endereco && (
                        <div className="flex items-start text-gray-600">
                          <MapPin className="w-5 h-5 mr-3 text-gray-400 mt-0.5" />
                          <span>{client.endereco}</span>
                        </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {client.matricula && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">Matrícula:</span>
                          <p className="text-gray-900">{client.matricula}</p>
                        </div>
                    )}

                    <div>
                      <span className="text-sm font-medium text-gray-500">Criado em:</span>
                      <p className="text-gray-900">{formatDate(client.createdAt)}</p>
                    </div>

                    {client.updatedAt > client.createdAt && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">Última atualização:</span>
                          <p className="text-gray-900">{formatDate(client.updatedAt)}</p>
                        </div>
                    )}
                  </div>
                </div>

                {client.telefonesAdicionais && client.telefonesAdicionais.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-500 mb-3">
                        Telefones Adicionais:
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {client.telefonesAdicionais.map((telefone, index) => (
                            <div key={index} className="flex items-center text-gray-600">
                              <Phone className="w-4 h-4 mr-2 text-gray-400" />
                              <span>{telefone}</span>
                            </div>
                        ))}
                      </div>
                    </div>
                )}

                {client.observacoes && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">
                        Observações:
                      </h4>
                      <p className="text-gray-900 bg-white p-3 rounded border">
                        {client.observacoes}
                      </p>
                    </div>
                )}
              </div>
            </div>

            {/* HISTÓRICO REMOVIDO */}
          </div>
        </div>
      </div>
  );
};

export default ClientView;
