import { CashFlow } from '../types';

const CASH_KEY = 'ct-cash-flows';

export class LocalCashService {
  static getCashFlows(): CashFlow[] {
    const stored = localStorage.getItem(CASH_KEY);
    if (stored) {
      const flows = JSON.parse(stored);
      return flows.map((flow: any) => ({
        ...flow,
        date: new Date(flow.date),
        createdAt: new Date(flow.createdAt),
      }));
    }
    return [];
  }

  static setCashFlows(flows: CashFlow[]): void {
    localStorage.setItem(CASH_KEY, JSON.stringify(flows));
  }

  static addCashFlow(cashFlowData: Omit<CashFlow, 'id' | 'createdAt'>): CashFlow {
    const flows = this.getCashFlows();
    const newFlow: CashFlow = {
      ...cashFlowData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    
    flows.push(newFlow);
    this.setCashFlows(flows);
    return newFlow;
  }

  static updateCashFlow(id: string, updates: Partial<CashFlow>): CashFlow | null {
    const flows = this.getCashFlows();
    const index = flows.findIndex(f => f.id === id);
    
    if (index === -1) return null;
    
    const updatedFlow = {
      ...flows[index],
      ...updates,
    };
    
    flows[index] = updatedFlow;
    this.setCashFlows(flows);
    return updatedFlow;
  }

  static deleteCashFlow(id: string): boolean {
    const flows = this.getCashFlows();
    const filteredFlows = flows.filter(f => f.id !== id);
    
    if (filteredFlows.length === flows.length) return false;
    
    this.setCashFlows(filteredFlows);
    return true;
  }
}