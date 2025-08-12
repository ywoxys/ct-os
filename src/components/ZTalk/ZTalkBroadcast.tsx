import React, { useState } from 'react';
import { Send, Calendar, Users, BarChart3, Plus, Eye } from 'lucide-react';
import { useZTalk } from '../../contexts/ZTalkContext';
import { ZTalkBroadcast } from '../../types';

const ZTalkBroadcastComponent: React.FC = () => {
  const { broadcasts, contacts, createBroadcast, sendBroadcast } = useZTalk();
  const [showForm, setShowForm] = useState(false);
  const [selectedBroadcast, setSelectedBroadcast] = useState<ZTalkBroadcast | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    recipients: [] as string[],
    scheduledFor: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const broadcastData = {
      title: formData.title,
      message: formData.message,
      recipients: formData.recipients,
      scheduledFor: formData.scheduledFor ? new Date(formData.scheduledFor) : undefined,
      status: formData.scheduledFor ? 'scheduled' as const : 'draft' as const,
    };
    
    createBroadcast(broadcastData);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      recipients: [],
      scheduledFor: '',
    });
    setShowForm(false);
  };

  const handleSendBroadcast = (broadcastId: string) => {
    if (window.confirm('Tem certeza que deseja enviar este disparo?')) {
      sendBroadcast(broadcastId);
    }
  };

  const getStatusColor = (status: ZTalkBroadcast['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'sending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'sent':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Disparos em Massa</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Envie mensagens para múltiplos contatos
          </p>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Disparo</span>
        </button>
      </div>

      {/* Broadcasts List */}
      <div className="space-y-4">
        {broadcasts.map((broadcast) => (
          <div
            key={broadcast.id}
            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">{broadcast.title}</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(broadcast.status)}`}>
                    {broadcast.status}
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {broadcast.message}
                </p>

                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{broadcast.recipients.length} destinatários</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {broadcast.scheduledFor 
                        ? `Agendado para ${formatDate(broadcast.scheduledFor)}`
                        : `Criado em ${formatDate(broadcast.createdAt)}`
                      }
                    </span>
                  </div>
                </div>

                {broadcast.status === 'sent' && (
                  <div className="flex items-center space-x-4 mt-2 text-sm">
                    <span className="text-green-600">✓ {broadcast.stats.sent} enviadas</span>
                    <span className="text-blue-600">📱 {broadcast.stats.delivered} entregues</span>
                    <span className="text-purple-600">👁 {broadcast.stats.read} lidas</span>
                    {broadcast.stats.failed > 0 && (
                      <span className="text-red-600">❌ {broadcast.stats.failed} falharam</span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => setSelectedBroadcast(broadcast)}
                  className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  title="Ver detalhes"
                >
                  <Eye className="w-4 h-4" />
                </button>
                
                {(broadcast.status === 'draft' || broadcast.status === 'scheduled') && (
                  <button
                    onClick={() => handleSendBroadcast(broadcast.id)}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Enviar Agora
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {broadcasts.length === 0 && (
        <div className="text-center py-12">
          <Send className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhum disparo criado
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Crie seu primeiro disparo em massa.
          </p>
        </div>
      )}

      {/* Broadcast Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Novo Disparo em Massa
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mensagem *
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formData.message.length}/1000 caracteres
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Destinatários *
                  </label>
                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 max-h-40 overflow-y-auto">
                    {contacts.map((contact) => (
                      <label key={contact.id} className="flex items-center space-x-2 py-1">
                        <input
                          type="checkbox"
                          checked={formData.recipients.includes(contact.phone)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                recipients: [...formData.recipients, contact.phone]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                recipients: formData.recipients.filter(r => r !== contact.phone)
                              });
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {contact.name} - {contact.phone}
                        </span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formData.recipients.length} destinatários selecionados
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Agendar para (opcional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledFor}
                    onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={formData.recipients.length === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Criar Disparo
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Details Modal */}
      {selectedBroadcast && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {selectedBroadcast.title}
                </h3>
                <button
                  onClick={() => setSelectedBroadcast(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Mensagem</h4>
                  <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    {selectedBroadcast.message}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Destinatários</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedBroadcast.recipients.length} contatos selecionados
                  </p>
                </div>

                {selectedBroadcast.status === 'sent' && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Estatísticas</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded">
                        <p className="text-sm text-green-600 dark:text-green-400">Enviadas</p>
                        <p className="text-xl font-bold text-green-700 dark:text-green-300">
                          {selectedBroadcast.stats.sent}
                        </p>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                        <p className="text-sm text-blue-600 dark:text-blue-400">Entregues</p>
                        <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                          {selectedBroadcast.stats.delivered}
                        </p>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded">
                        <p className="text-sm text-purple-600 dark:text-purple-400">Lidas</p>
                        <p className="text-xl font-bold text-purple-700 dark:text-purple-300">
                          {selectedBroadcast.stats.read}
                        </p>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded">
                        <p className="text-sm text-red-600 dark:text-red-400">Falharam</p>
                        <p className="text-xl font-bold text-red-700 dark:text-red-300">
                          {selectedBroadcast.stats.failed}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZTalkBroadcastComponent;