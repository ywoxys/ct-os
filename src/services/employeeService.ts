import { Employee } from '../types';

const EMPLOYEES_KEY = 'ct-employees';

export class EmployeeService {
  static getEmployees(): Employee[] {
    const stored = localStorage.getItem(EMPLOYEES_KEY);
    if (stored) {
      const employees = JSON.parse(stored);
      return employees.map((emp: any) => ({
        ...emp,
        createdAt: new Date(emp.createdAt),
        updatedAt: new Date(emp.updatedAt),
        lastLogin: emp.lastLogin ? new Date(emp.lastLogin) : undefined,
      }));
    }
    return [];
  }

  static setEmployees(employees: Employee[]): void {
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
  }

  static async createEmployee(employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<Employee> {
    const employees = this.getEmployees();
    const newEmployee: Employee = {
      ...employeeData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    employees.push(newEmployee);
    this.setEmployees(employees);
    return newEmployee;
  }

  static async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee | null> {
    const employees = this.getEmployees();
    const index = employees.findIndex(e => e.id === id);
    
    if (index === -1) return null;
    
    const updatedEmployee = {
      ...employees[index],
      ...updates,
      updatedAt: new Date(),
    };
    
    employees[index] = updatedEmployee;
    this.setEmployees(employees);
    return updatedEmployee;
  }

  static async deleteEmployee(id: string): Promise<boolean> {
    const employees = this.getEmployees();
    const filteredEmployees = employees.filter(e => e.id !== id);
    
    if (filteredEmployees.length === employees.length) return false;
    
    this.setEmployees(filteredEmployees);
    return true;
  }

  static async findById(id: string): Promise<Employee | null> {
    const employees = this.getEmployees();
    return employees.find(e => e.id === id) || null;
  }

  static async searchEmployees(query: string): Promise<Employee[]> {
    const employees = this.getEmployees();
    const searchTerm = query.toLowerCase();
    
    return employees.filter(employee => 
      employee.name.toLowerCase().includes(searchTerm) ||
      employee.email.toLowerCase().includes(searchTerm) ||
      employee.login.toLowerCase().includes(searchTerm) ||
      employee.setor.toLowerCase().includes(searchTerm)
    );
  }

  static async updateLastLogin(id: string): Promise<void> {
    await this.updateEmployee(id, { lastLogin: new Date() });
  }
}