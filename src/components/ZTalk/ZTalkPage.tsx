import React, { useState } from 'react';
import { MessageSquare, Send, Users, BarChart3, Settings, Plus, Search, Filter } from 'lucide-react';
import { useZTalk } from '../../contexts/ZTalkContext';
import { useAuth } from '../../contexts/AuthContext';
import ZTalkConversations from './ZTalkConversations';
import ZTalkBroadcast from './ZTalkBroadcast';
import ZTalkQueues from './ZTalkQueues';
import ZTalkContacts from './ZTalkContacts';

const ZTalkPage: React.FC = () => {
  const { conversations, contacts, broadcasts, queues } = useZTalk();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('conversations');

  const canAccessZTalk = user?.role === 'administrador-all' || user?.role === 'administrador';

  if (!canAccessZTalk) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Acesso Restrito</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Apenas administradores podem acessar o módulo ZTalk.
          </p>
        </div>
      </div>
    );
  }

  const stats = {
    totalConversations: conversations.length,
    openConversations: conversations.filter(c => c.status === 'open').length,
    totalContacts: contacts.length,
    activeBroadcasts: broadcasts.filter(b => b.status === 'sending' || b.status === 'scheduled').length,
    activeQueues: queues.filter(q => q.isActive).length,
  };

  const tabs = [
    { id: 'conversations', label: 'Atendimentos', icon: MessageSquare },
    { id: 'contacts', label: 'Contatos', icon: Users },
    { id: 'broadcast', label: 'Disparos', icon: Send },
    { id: 'queues', label: 'Filas', icon: Settings },
    { id: 'analytics', label: 'Análises', icon: BarChart3 },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'conversations':
        return <ZTalkConversations />;
      case 'contacts':
        return <ZTalkContacts />;
      case 'broadcast':
        return <ZTalkBroadcast />;
      case 'queues':
        return <ZTalkQueues />;
      case 'analytics':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Análises ZTalk</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100">Conversas por Status</h4>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">Abertas:</span>
                    <span className="font-medium">{conversations.filter(c => c.status === 'open').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">Em andamento:</span>
                    <span className="font-medium">{conversations.filter(c => c.status === 'in_progress').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">Fechadas:</span>
                    <span className="font-medium">{conversations.filter(c => c.status === 'closed').length}</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 dark:text-green-100">Disparos</h4>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700 dark:text-green-300">Total:</span>
                    <span className="font-medium">{broadcasts.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700 dark:text-green-300">Enviados:</span>
                    <span className="font-medium">{broadcasts.filter(b => b.status === 'sent').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700 dark:text-green-300">Agendados:</span>
                    <span className="font-medium">{broadcasts.filter(b => b.status === 'scheduled').length}</span>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900 dark:text-purple-100">Filas</h4>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-purple-700 dark:text-purple-300">Ativas:</span>
                    <span className="font-medium">{stats.activeQueues}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-700 dark:text-purple-300">Total:</span>
                    <span className="font-medium">{queues.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ZTalk - Gerenciamento</h1>
          <p className="text-gray-600 dark:text-gray-400">Central de atendimento e comunicação</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Conversas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalConversations}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Abertas</p>
              <p className="text-2xl font-bold text-orange-600">{stats.openConversations}</p>
            </div>
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
              <span className="text-orange-600 dark:text-orange-400 text-sm">●</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Contatos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalContacts}</p>
            </div>
            <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Disparos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeBroadcasts}</p>
            </div>
            <Send className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Filas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeQueues}</p>
            </div>
            <Settings className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default ZTalkPage;