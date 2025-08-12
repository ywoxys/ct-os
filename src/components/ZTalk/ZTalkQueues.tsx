import React, { useState } from 'react';
import { Settings, Users, Clock, Plus, Edit, Trash, ToggleLeft, ToggleRight } from 'lucide-react';
import { useZTalk } from '../../contexts/ZTalkContext';
import { useEmployees } from '../../contexts/EmployeeContext';
import { ZTalkQueue } from '../../types';

const ZTalkQueues: React.FC = () => {
  const { queues, createQueue, updateQueue, deleteQueue } = useZTalk();
  const { employees } = useEmployees();
  const [showForm, setShowForm] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState<ZTalkQueue | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    members: [] as string[],
    autoAssign: true,
    maxConversations: 5,
    workingHours: {
      start: '09:00',
      end: '18:00',
      days: [1, 2, 3, 4, 5] as number[],
    },
    isActive: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedQueue) {
      updateQueue(selectedQueue.id, formData);
    } else {
      createQueue(formData);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      members: [],
      autoAssign: true,
      maxConversations: 5,
      workingHours: {
        start: '09:00',
        end: '18:00',
        days: [1, 2, 3, 4, 5],
      },
      isActive: true,
    });
    setSelectedQueue(null);
    setShowForm(false);
  };

  const handleEdit = (queue: ZTalkQueue) => {
    setSelectedQueue(queue);
    setFormData({
      name: queue.name,
      description: queue.description || '',
      members: queue.members,
      autoAssign: queue.autoAssign,
      maxConversations: queue.maxConversations,
      workingHours: queue.workingHours,
      isActive: queue.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = (queueId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta fila?')) {
      deleteQueue(queueId);
    }
  };

  const toggleQueueStatus = (queueId: string, currentStatus: boolean) => {
    updateQueue(queueId, { isActive: !currentStatus });
  };

  const getDayName = (day: number) => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return days[day];
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.name || 'Funcionário não encontrado';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filas de Atendimento</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configure filas para distribuição automática de conversas
          </p>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Fila</span>
        </button>
      </div>

      {/* Queues List */}
      <div className="space-y-4">
        {queues.map((queue) => (
          <div
            key={queue.id}
            className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${
              !queue.isActive ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">{queue.name}</h4>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      queue.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {queue.isActive ? 'Ativa' : 'Inativa'}
                    </span>
                    {queue.autoAssign && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Auto-atribuição
                      </span>
                    )}
                  </div>
                </div>

                {queue.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {queue.description}
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>Membros: {queue.members.length}</span>
                    </div>
                    <div className="ml-6 mt-1">
                      {queue.members.slice(0, 3).map((memberId) => (
                        <div key={memberId} className="text-xs text-gray-500 dark:text-gray-400">
                          {getEmployeeName(memberId)}
                        </div>
                      ))}
                      {queue.members.length > 3 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          +{queue.members.length - 3} mais
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <Settings className="w-4 h-4" />
                      <span>Máx. conversas: {queue.maxConversations}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>
                        {queue.workingHours.start} - {queue.workingHours.end}
                      </span>
                    </div>
                    <div className="ml-6 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {queue.workingHours.days.map(day => getDayName(day)).join(', ')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => toggleQueueStatus(queue.id, queue.isActive)}
                  className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  title={queue.isActive ? 'Desativar fila' : 'Ativar fila'}
                >
                  {queue.isActive ? (
                    <ToggleRight className="w-5 h-5 text-green-600" />
                  ) : (
                    <ToggleLeft className="w-5 h-5" />
                  )}
                </button>
                
                <button
                  onClick={() => handleEdit(queue)}
                  className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => handleDelete(queue.id)}
                  className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  title="Excluir"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {queues.length === 0 && (
        <div className="text-center py-12">
          <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhuma fila configurada
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Crie sua primeira fila de atendimento.
          </p>
        </div>
      )}

      {/* Queue Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {selectedQueue ? 'Editar Fila' : 'Nova Fila'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Membros da Fila
                  </label>
                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 max-h-40 overflow-y-auto">
                    {employees.filter(e => e.isActive).map((employee) => (
                      <label key={employee.id} className="flex items-center space-x-2 py-1">
                        <input
                          type="checkbox"
                          checked={formData.members.includes(employee.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                members: [...formData.members, employee.id]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                members: formData.members.filter(m => m !== employee.id)
                              });
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {employee.name} - {employee.setor}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Máximo de Conversas
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={formData.maxConversations}
                      onChange={(e) => setFormData({ ...formData, maxConversations: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      id="autoAssign"
                      checked={formData.autoAssign}
                      onChange={(e) => setFormData({ ...formData, autoAssign: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="autoAssign" className="text-sm text-gray-700 dark:text-gray-300">
                      Auto-atribuição
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Horário de Funcionamento
                  </label>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Início</label>
                      <input
                        type="time"
                        value={formData.workingHours.start}
                        onChange={(e) => setFormData({
                          ...formData,
                          workingHours: { ...formData.workingHours, start: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Fim</label>
                      <input
                        type="time"
                        value={formData.workingHours.end}
                        onChange={(e) => setFormData({
                          ...formData,
                          workingHours: { ...formData.workingHours, end: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">Dias da Semana</label>
                    <div className="flex space-x-2">
                      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => (
                        <label key={index} className="flex flex-col items-center">
                          <input
                            type="checkbox"
                            checked={formData.workingHours.days.includes(index)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  workingHours: {
                                    ...formData.workingHours,
                                    days: [...formData.workingHours.days, index]
                                  }
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  workingHours: {
                                    ...formData.workingHours,
                                    days: formData.workingHours.days.filter(d => d !== index)
                                  }
                                });
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
                    Fila ativa
                  </label>
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
                    disabled={formData.members.length === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {selectedQueue ? 'Salvar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZTalkQueues;