import React from 'react';
import { Edit, Trash, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { CashFlow } from '../../types';
import { useCash } from '../../contexts/CashContext';
import { useAuth } from '../../contexts/AuthContext';

interface CashListProps {
  cashFlows: CashFlow[];
  onEdit?: (cash: CashFlow) => void;
}

const CashList: React.FC<CashListProps> = ({ cashFlows, onEdit }) => {
  const { deleteCashFlow } = useCash();
  const { user } = useAuth();

  const canDelete = user?.role === 'administrador-all';

  const handleDelete = (cashId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta movimentação?')) {
      deleteCashFlow(cashId);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  if (cashFlows.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhuma movimentação encontrada</h3>
        <p className="text-gray-500 dark:text-gray-400">Comece adicionando sua primeira movimentação financeira.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {cashFlows.map((cash) => (
        <div key={cash.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                cash.type === 'entrada' 
                  ? 'bg-green-100 dark:bg-green-900' 
                  : 'bg-red-100 dark:bg-red-900'
              }`}>
                {cash.type === 'entrada' ? (
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {cash.description}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    cash.type === 'entrada'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {cash.type === 'entrada' ? 'Entrada' : 'Saída'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                  <span>{formatDate(cash.date)}</span>
                  {cash.category && <span>• {cash.category}</span>}
                  <span>• por {cash.userName}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className={`text-lg font-semibold ${
                  cash.type === 'entrada' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {cash.type === 'entrada' ? '+' : '-'}{formatCurrency(cash.amount)}
                </p>
              </div>

              <div className="flex space-x-2">
                {onEdit && (
                  <button
                    onClick={() => onEdit(cash)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                
                {canDelete && (
                  <button
                    onClick={() => handleDelete(cash.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CashList;