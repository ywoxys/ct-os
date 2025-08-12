import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Employee } from '../types';
import { useAuth } from './AuthContext';
import { UserService } from '../services/userService';
import { LocalUserService } from '../services/localStorageService';
import { useDatabase } from '../hooks/useDatabase';

interface EmployeeContextType {
  employees: Employee[];
  addEmployee: (employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) => Promise<void>;
  updateEmployee: (id: string, updates: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  searchEmployees: (query: string) => Promise<Employee[]>;
}

const EmployeeContext = createContext<EmployeeContextType | null>(null);

interface EmployeeProviderProps {
  children: ReactNode;
}

export const EmployeeProvider: React.FC<EmployeeProviderProps> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { isConnected, useLocalMode } = useDatabase();

  useEffect(() => {
    const loadData = async () => {
      if (isConnected) {
        try {
          let employeesData;
          
          if (useLocalMode) {
            employeesData = await LocalUserService.findAll();
          } else {
            employeesData = await UserService.findAll();
          }
          
          // Convert User to Employee format
          const mappedEmployees: Employee[] = employeesData.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            setor: user.setor,
            login: user.login,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.createdAt, // Users don't have updatedAt, use createdAt
            createdBy: '1', // Default admin
            updatedBy: '1', // Default admin
          }));
          
          setEmployees(mappedEmployees);
        } catch (error) {
          console.error('Error loading employees:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadData();
  }, [isConnected, useLocalMode]);

  const refreshData = async () => {
    if (isConnected) {
      try {
        let employeesData;
        
        if (useLocalMode) {
          employeesData = await LocalUserService.findAll();
        } else {
          employeesData = await UserService.findAll();
        }
        
        const mappedEmployees: Employee[] = employeesData.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          setor: user.setor,
          login: user.login,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.createdAt,
          createdBy: '1',
          updatedBy: '1',
        }));
        
        setEmployees(mappedEmployees);
      } catch (error) {
        console.error('Error refreshing employees:', error);
      }
    }
  };

  const addEmployee = async (employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) => {
    if (!user) return;

    try {
      const userData = {
        name: employeeData.name,
        email: employeeData.email,
        role: employeeData.role,
        setor: employeeData.setor,
        login: employeeData.login,
        password: 'temp123', // Default password
        is_active: employeeData.isActive,
      };

      if (useLocalMode) {
        // For local mode, add to localStorage
        const users = JSON.parse(localStorage.getItem('ct-users') || '[]');
        const newUser = {
          ...userData,
          id: Date.now().toString(),
          createdAt: new Date(),
          isActive: userData.is_active,
        };
        users.push(newUser);
        localStorage.setItem('ct-users', JSON.stringify(users));
      } else {
        await UserService.createUser(userData);
      }
      
      await refreshData();
    } catch (error) {
      console.error('Error adding employee:', error);
      throw error;
    }
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    if (!user) return;

    try {
      const updateData = {
        name: updates.name,
        email: updates.email,
        role: updates.role,
        setor: updates.setor,
        login: updates.login,
        is_active: updates.isActive,
      };

      if (useLocalMode) {
        const users = JSON.parse(localStorage.getItem('ct-users') || '[]');
        const index = users.findIndex((u: any) => u.id === id);
        if (index !== -1) {
          users[index] = { ...users[index], ...updateData, isActive: updateData.is_active };
          localStorage.setItem('ct-users', JSON.stringify(users));
        }
      } else {
        await UserService.updateUser(id, updateData);
      }
      
      await refreshData();
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  };

  const deleteEmployee = async (id: string) => {
    if (!user) return;

    try {
      if (useLocalMode) {
        const users = JSON.parse(localStorage.getItem('ct-users') || '[]');
        const index = users.findIndex((u: any) => u.id === id);
        if (index !== -1) {
          users[index].isActive = false;
          localStorage.setItem('ct-users', JSON.stringify(users));
        }
      } else {
        await UserService.deleteUser(id);
      }
      
      await refreshData();
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw error;
    }
  };

  const searchEmployees = async (query: string): Promise<Employee[]> => {
    const searchTerm = query.toLowerCase();
    
    return employees.filter(employee => 
      employee.name.toLowerCase().includes(searchTerm) ||
      employee.email.toLowerCase().includes(searchTerm) ||
      employee.login.toLowerCase().includes(searchTerm)
    ).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Carregando funcionários...</p>
      </div>
    </div>;
  }

  const value: EmployeeContextType = {
    employees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    searchEmployees,
  };

  return <EmployeeContext.Provider value={value}>{children}</EmployeeContext.Provider>;
};

export const useEmployees = () => {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error('useEmployees deve ser usado dentro de um EmployeeProvider');
  }
  return context;
};