import { CashFlow } from '../types';

const CASH_KEY = 'ct-cash-flows';

export class CashService {
  static getCashFlows(): CashFlow[] {
    const stored = localStorage.getItem(CASH_KEY);
    if (stored) {
      const flows = JSON.parse(stored);
      return flows.map((flow: any) => ({
        ...flow,
        date: new Date(flow.date),
        createdAt: new Date(flow.createdAt),
        updatedAt: new Date(flow.updatedAt),
      }));
    }
    return [];
  }

  static setCashFlows(flows: CashFlow[]): void {
    localStorage.setItem(CASH_KEY, JSON.stringify(flows));
  }

  static async createCashFlow(flowData: Omit<CashFlow, 'id' | 'createdAt' | 'updatedAt'>): Promise<CashFlow> {
    const flows = this.getCashFlows();
    const newFlow: CashFlow = {
      ...flowData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    flows.push(newFlow);
    this.setCashFlows(flows);
    return newFlow;
  }

  static async updateCashFlow(id: string, updates: Partial<CashFlow>): Promise<CashFlow | null> {
    const flows = this.getCashFlows();
    const index = flows.findIndex(f => f.id === id);
    
    if (index === -1) return null;
    
    const updatedFlow = {
      ...flows[index],
      ...updates,
      updatedAt: new Date(),
    };
    
    flows[index] = updatedFlow;
    this.setCashFlows(flows);
    return updatedFlow;
  }

  static async deleteCashFlow(id: string): Promise<boolean> {
    const flows = this.getCashFlows();
    const filteredFlows = flows.filter(f => f.id !== id);
    
    if (filteredFlows.length === flows.length) return false;
    
    this.setCashFlows(filteredFlows);
    return true;
  }

  static async getCashFlowsByDateRange(startDate: Date, endDate: Date): Promise<CashFlow[]> {
    const flows = this.getCashFlows();
    return flows.filter(flow => {
      const flowDate = new Date(flow.date);
      return flowDate >= startDate && flowDate <= endDate;
    });
  }

  static async getCashFlowsByUser(userId: string): Promise<CashFlow[]> {
    const flows = this.getCashFlows();
    return flows.filter(flow => flow.userId === userId);
  }

  static calculateBalance(flows: CashFlow[]): number {
    return flows.reduce((balance, flow) => {
      return flow.type === 'entrada' ? balance + flow.amount : balance - flow.amount;
    }, 0);
  }

  static getCategories(): string[] {
    const flows = this.getCashFlows();
    const categories = new Set(flows.map(f => f.category).filter(Boolean));
    return Array.from(categories) as string[];
  }
}