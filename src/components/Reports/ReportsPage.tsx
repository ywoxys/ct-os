import React, { useState } from 'react';
import { BarChart3, Download, Calendar, Filter, TrendingUp, Users, DollarSign, MessageSquare } from 'lucide-react';
import { useClients } from '../../contexts/ClientContext';
import { useCash } from '../../contexts/CashContext';
import { useEmployees } from '../../contexts/EmployeeContext';
import { useZTalk } from '../../contexts/ZTalkContext';
import { useAuth } from '../../contexts/AuthContext';

const ReportsPage: React.FC = () => {
  const { clients } = useClients();
  const { cashFlows } = useCash();
  const { employees } = useEmployees();
  const { conversations, messages } = useZTalk();
  const { user } = useAuth();
  
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('overview');

  const canViewReports = user?.role === 'administrador-all' || user?.role === 'administrador';

  if (!canViewReports) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Acesso Restrito</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Apenas administradores podem acessar os relatórios do sistema.
          </p>
        </div>
      </div>
    );
  }

  const getPeriodData = () => {
    const now = new Date();
    let startDate: Date;

    switch (selectedPeriod) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return {
      clients: clients.filter(c => new Date(c.createdAt) >= startDate),
      cashFlows: cashFlows.filter(c => new Date(c.createdAt) >= startDate),
      conversations: conversations.filter(c => new Date(c.createdAt) >= startDate),
      messages: messages.filter(m => new Date(m.timestamp) >= startDate),
    };
  };

  const periodData = getPeriodData();

  const stats = {
    totalClients: clients.length,
    newClients: periodData.clients.length,
    totalRevenue: cashFlows.filter(c => c.type === 'entrada').reduce((sum, c) => sum + c.amount, 0),
    periodRevenue: periodData.cashFlows.filter(c => c.type === 'entrada').reduce((sum, c) => sum + c.amount, 0),
    totalExpenses: cashFlows.filter(c => c.type === 'saida').reduce((sum, c) => sum + c.amount, 0),
    periodExpenses: periodData.cashFlows.filter(c => c.type === 'saida').reduce((sum, c) => sum + c.amount, 0),
    activeEmployees: employees.filter(e => e.isActive).length,
    totalConversations: conversations.length,
    periodConversations: periodData.conversations.length,
    totalMessages: messages.length,
    periodMessages: periodData.messages.length,
  };

  const exportReport = () => {
    const reportData = {
      period: selectedPeriod,
      generatedAt: new Date().toISOString(),
      stats,
      clients: periodData.clients,
      cashFlows: periodData.cashFlows,
      conversations: periodData.conversations,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Relatórios</h1>
          <p className="text-gray-600 dark:text-gray-400">Análise completa dos dados do sistema</p>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Última semana</option>
            <option value="month">Este mês</option>
            <option value="quarter">Este trimestre</option>
            <option value="year">Este ano</option>
          </select>

          <button
            onClick={exportReport}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Clientes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalClients}</p>
              <p className="text-sm text-green-600">+{stats.newClients} no período</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Receita</p>
              <p className="text-2xl font-bold text-green-600">
                R$ {stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-green-600">
                +R$ {stats.periodRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} no período
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Despesas</p>
              <p className="text-2xl font-bold text-red-600">
                R$ {stats.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-red-600">
                +R$ {stats.periodExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} no período
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Atendimentos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalConversations}</p>
              <p className="text-sm text-blue-600">+{stats.periodConversations} no período</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clients Report */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Relatório de Clientes</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total de clientes</span>
              <span className="font-medium text-gray-900 dark:text-white">{stats.totalClients}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Novos no período</span>
              <span className="font-medium text-green-600">+{stats.newClients}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Taxa de crescimento</span>
              <span className="font-medium text-blue-600">
                {stats.totalClients > 0 ? ((stats.newClients / stats.totalClients) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Financial Report */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Relatório Financeiro</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Receita total</span>
              <span className="font-medium text-green-600">
                R$ {stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Despesas totais</span>
              <span className="font-medium text-red-600">
                R$ {stats.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Lucro líquido</span>
              <span className={`font-medium ${stats.totalRevenue - stats.totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {(stats.totalRevenue - stats.totalExpenses).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* ZTalk Report */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Relatório ZTalk</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total de conversas</span>
              <span className="font-medium text-gray-900 dark:text-white">{stats.totalConversations}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Mensagens enviadas</span>
              <span className="font-medium text-blue-600">{stats.totalMessages}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Conversas abertas</span>
              <span className="font-medium text-orange-600">
                {conversations.filter(c => c.status === 'open').length}
              </span>
            </div>
          </div>
        </div>

        {/* Team Report */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Relatório da Equipe</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Funcionários ativos</span>
              <span className="font-medium text-green-600">{stats.activeEmployees}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Administradores</span>
              <span className="font-medium text-blue-600">
                {employees.filter(e => e.role.includes('administrador')).length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Funcionários WhatsApp</span>
              <span className="font-medium text-purple-600">
                {employees.filter(e => e.role === 'whatsapp').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;