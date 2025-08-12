import React, { useState } from 'react';
import { MessageSquare, User, Clock, CheckCircle, XCircle, Play, Pause } from 'lucide-react';
import { useZTalk } from '../../contexts/ZTalkContext';
import { useAuth } from '../../contexts/AuthContext';
import { ZTalkConversation } from '../../types';

const ZTalkConversations: React.FC = () => {
  const { 
    conversations, 
    assignConversation, 
    updateConversationStatus, 
    closeConversation,
    createConversation,
    contacts 
  } = useZTalk();
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState('');

  const filteredConversations = selectedStatus === 'all' 
    ? conversations 
    : conversations.filter(c => c.status === selectedStatus);

  const getStatusColor = (status: ZTalkConversation['status']) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: ZTalkConversation['status']) => {
    switch (status) {
      case 'open':
        return <CheckCircle className="w-4 h-4" />;
      case 'in_progress':
        return <Play className="w-4 h-4" />;
      case 'pending':
        return <Pause className="w-4 h-4" />;
      case 'closed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const handleAssignToMe = (conversationId: string) => {
    if (user) {
      assignConversation(conversationId, user.id);
    }
  };

  const handleStartConversation = () => {
    if (selectedContactId) {
      createConversation(selectedContactId);
      setSelectedContactId('');
      setShowNewConversation(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os status</option>
            <option value="open">Abertas</option>
            <option value="in_progress">Em andamento</option>
            <option value="pending">Pendentes</option>
            <option value="closed">Fechadas</option>
          </select>
        </div>

        <button
          onClick={() => setShowNewConversation(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Iniciar Atendimento</span>
        </button>
      </div>

      {/* Conversations List */}
      <div className="space-y-4">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhuma conversa encontrada
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {selectedStatus === 'all' 
                ? 'Inicie um novo atendimento para começar.'
                : `Nenhuma conversa com status "${selectedStatus}".`
              }
            </p>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {conversation.contactName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {conversation.contactPhone}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(conversation.status)}`}>
                      {getStatusIcon(conversation.status)}
                      <span className="ml-1 capitalize">{conversation.status.replace('_', ' ')}</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>Criada em {formatDate(conversation.createdAt)}</span>
                    {conversation.assignedToName && (
                      <span>• Atribuída a {conversation.assignedToName}</span>
                    )}
                    {conversation.lastMessage && (
                      <span>• Última mensagem: {conversation.lastMessage.substring(0, 50)}...</span>
                    )}
                  </div>

                  {conversation.tags.length > 0 && (
                    <div className="flex items-center space-x-2 mt-2">
                      {conversation.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {!conversation.assignedTo && (
                    <button
                      onClick={() => handleAssignToMe(conversation.id)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Assumir
                    </button>
                  )}
                  
                  {conversation.status !== 'in_progress' && conversation.status !== 'closed' && (
                    <button
                      onClick={() => updateConversationStatus(conversation.id, 'in_progress')}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      Iniciar
                    </button>
                  )}
                  
                  {conversation.status !== 'closed' && (
                    <button
                      onClick={() => closeConversation(conversation.id)}
                      className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                    >
                      Fechar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Conversation Modal */}
      {showNewConversation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Iniciar Novo Atendimento
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Selecionar Contato
                  </label>
                  <select
                    value={selectedContactId}
                    onChange={(e) => setSelectedContactId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione um contato</option>
                    {contacts.map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.name} - {contact.phone}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => setShowNewConversation(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleStartConversation}
                  disabled={!selectedContactId}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Iniciar Atendimento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZTalkConversations;