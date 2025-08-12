import React, { useState } from 'react';
import { Plus, DollarSign, TrendingUp, TrendingDown, Calendar, Filter } from 'lucide-react';
import { useCash } from '../contexts/CashContext';
import { useAuth } from '../contexts/AuthContext';
import CashForm from '../components/Cash/CashForm';
import CashList from '../components/Cash/CashList';
import { CashFlow } from '../types';

const CashPage: React.FC = () => {
  const { cashFlows, getTotalBalance, getTotalEntradas, getTotalSaidas } = useCash();
  const { user } = useAuth();
  
  const [showForm, setShowForm] = useState(false);
  const [selectedCash, setSelectedCash] = useState<CashFlow | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'entrada' | 'saida'>('all');
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');

  const filteredCashFlows = cashFlows.filter(cash => {
    if (filterType !== 'all' && cash.type !== filterType) return false;
    
    const today = new Date();
    const cashDate = new Date(cash.date);
    
    switch (dateFilter) {
      case 'today':
        return cashDate.toDateString() === today.toDateString();
      case 'week':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return cashDate >= weekAgo;
      case 'month':
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return cashDate >= monthAgo;
      default:
        return true;
    }
  });

  const handleAddCash = () => {
    setSelectedCash(null);
    setShowForm(true);
  };

  const handleEditCash = (cash: CashFlow) => {
    setSelectedCash(cash);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedCash(null);
  };

  const canManageCash = user?.role === 'administrador-all' || user?.role === 'administrador';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Controle de Caixa</h1>
          <p className="text-gray-600 dark:text-gray-400">Gerencie entradas e saídas financeiras</p>
        </div>

        {canManageCash && (
          <button
            onClick={handleAddCash}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Movimentação</span>
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Saldo Total</p>
              <p className={`text-2xl font-bold ${getTotalBalance() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {getTotalBalance().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Entradas</p>
              <p className="text-2xl font-bold text-green-600">
                R$ {getTotalEntradas().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Saídas</p>
              <p className="text-2xl font-bold text-red-600">
                R$ {getTotalSaidas().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtros:</span>
          </div>
          
          <div className="flex space-x-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os tipos</option>
              <option value="entrada">Entradas</option>
              <option value="saida">Saídas</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todo o período</option>
              <option value="today">Hoje</option>
              <option value="week">Última semana</option>
              <option value="month">Último mês</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cash List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <CashList
          cashFlows={filteredCashFlows}
          onEdit={canManageCash ? handleEditCash : undefined}
        />
      </div>

      {/* Modal */}
      {showForm && (
        <CashForm
          cash={selectedCash || undefined}
          onClose={handleCloseForm}
          onSave={() => {}}
        />
      )}
    </div>
  );
};

export default CashPage;