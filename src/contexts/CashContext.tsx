import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CashFlow } from '../types';
import { useAuth } from './AuthContext';
import { useDatabase } from '../hooks/useDatabase';
import { SupabaseCashService } from '../services/supabaseCashService';
import { LocalCashService } from '../services/localCashService';

interface CashContextType {
  cashFlows: CashFlow[];
  addCashFlow: (cashFlow: Omit<CashFlow, 'id' | 'userId' | 'userName' | 'createdAt'>) => void;
  updateCashFlow: (id: string, updates: Partial<CashFlow>) => void;
  deleteCashFlow: (id: string) => void;
  getTotalBalance: () => number;
  getTotalEntradas: () => number;
  getTotalSaidas: () => number;
}

const CashContext = createContext<CashContextType | null>(null);

interface CashProviderProps {
  children: ReactNode;
}

// Local storage functions
const getCashFlows = (): CashFlow[] => {
  const stored = localStorage.getItem('ct-cash-flows');
  if (stored) {
    const flows = JSON.parse(stored);
    return flows.map((flow: any) => ({
      ...flow,
      date: new Date(flow.date),
      createdAt: new Date(flow.createdAt),
    }));
  }
  return [];
};

const setCashFlows = (flows: CashFlow[]): void => {
  localStorage.setItem('ct-cash-flows', JSON.stringify(flows));
};

export const CashProvider: React.FC<CashProviderProps> = ({ children }) => {
  const [cashFlows, setCashFlowsState] = useState<CashFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { isConnected, useLocalMode } = useDatabase();

  useEffect(() => {
    const loadData = async () => {
      if (isConnected) {
        try {
          let flows;
          if (useLocalMode) {
            flows = LocalCashService.getCashFlows();
          } else {
            flows = await SupabaseCashService.findAll();
          }
          setCashFlowsState(flows);
        } catch (error) {
          console.error('Error loading cash flows:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadData();
  }, [isConnected, useLocalMode]);

  const refreshData = () => {
    const loadData = async () => {
      try {
        let flows;
        if (useLocalMode) {
          flows = LocalCashService.getCashFlows();
        } else {
          flows = await SupabaseCashService.findAll();
        }
        setCashFlowsState(flows);
      } catch (error) {
        console.error('Error refreshing cash flows:', error);
      }
    };
    loadData();
  };

  const addCashFlow = async (cashFlowData: Omit<CashFlow, 'id' | 'userId' | 'userName' | 'createdAt'>) => {
    if (!user) return;

    try {
      if (useLocalMode) {
        LocalCashService.addCashFlow({
          ...cashFlowData,
          userId: user.id,
          userName: user.name,
        });
      } else {
        await SupabaseCashService.createCashFlow({
          user_id: user.id,
          user_name: user.name,
          type: cashFlowData.type,
          amount: cashFlowData.amount,
          description: cashFlowData.description,
          category: cashFlowData.category,
          date: cashFlowData.date.toISOString().split('T')[0],
        });
      }
      refreshData();
    } catch (error) {
      console.error('Error adding cash flow:', error);
    }
  };

  const updateCashFlow = async (id: string, updates: Partial<CashFlow>) => {
    try {
      if (useLocalMode) {
        LocalCashService.updateCashFlow(id, updates);
      } else {
        const updateData: any = {};
        if (updates.type) updateData.type = updates.type;
        if (updates.amount) updateData.amount = updates.amount;
        if (updates.description) updateData.description = updates.description;
        if (updates.category) updateData.category = updates.category;
        if (updates.date) updateData.date = updates.date.toISOString().split('T')[0];
        
        await SupabaseCashService.updateCashFlow(id, updateData);
      }
      refreshData();
    } catch (error) {
      console.error('Error updating cash flow:', error);
    }
  };

  const deleteCashFlow = async (id: string) => {
    try {
      if (useLocalMode) {
        LocalCashService.deleteCashFlow(id);
      } else {
        await SupabaseCashService.deleteCashFlow(id);
      }
      refreshData();
    } catch (error) {
      console.error('Error deleting cash flow:', error);
    }
  };

  const getTotalBalance = () => {
    return cashFlows.reduce((total, flow) => {
      return flow.type === 'entrada' ? total + flow.amount : total - flow.amount;
    }, 0);
  };

  const getTotalEntradas = () => {
    return cashFlows
      .filter(flow => flow.type === 'entrada')
      .reduce((total, flow) => total + flow.amount, 0);
  };

  const getTotalSaidas = () => {
    return cashFlows
      .filter(flow => flow.type === 'saida')
      .reduce((total, flow) => total + flow.amount, 0);
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Carregando dados do caixa...</p>
      </div>
    </div>;
  }

  const value: CashContextType = {
    cashFlows,
    addCashFlow,
    updateCashFlow,
    deleteCashFlow,
    getTotalBalance,
    getTotalEntradas,
    getTotalSaidas,
  };

  return <CashContext.Provider value={value}>{children}</CashContext.Provider>;
};

export const useCash = () => {
  const context = useContext(CashContext);
  if (!context) {
    throw new Error('useCash deve ser usado dentro de um CashProvider');
  }
  return context;
};