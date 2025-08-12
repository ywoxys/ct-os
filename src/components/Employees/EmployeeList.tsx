import React from 'react';
import { Edit, Trash, Mail, User, Shield, ShieldCheck } from 'lucide-react';
import { Employee } from '../../types';
import { useEmployees } from '../../contexts/EmployeeContext';
import { useAuth } from '../../contexts/AuthContext';

interface EmployeeListProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({ employees, onEdit }) => {
  const { deleteEmployee } = useEmployees();
  const { user } = useAuth();

  const canDelete = user?.role === 'administrador-all';

  const handleDelete = (employeeId: string) => {
    if (window.confirm('Tem certeza que deseja desativar este funcionário?')) {
      deleteEmployee(employeeId);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'administrador-all':
        return <ShieldCheck className="w-4 h-4 text-red-600" />;
      case 'administrador':
        return <Shield className="w-4 h-4 text-blue-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'administrador-all':
        return 'Admin Geral';
      case 'administrador':
        return 'Administrador';
      default:
        return 'Funcionário';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'administrador-all':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'administrador':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  if (employees.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhum funcionário encontrado</h3>
        <p className="text-gray-500 dark:text-gray-400">Comece cadastrando seu primeiro funcionário.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {employees.map((employee) => (
        <div key={employee.id} className={`bg-white dark:bg-gray-700 rounded-lg shadow-sm border hover:shadow-md transition-shadow ${
          employee.isActive 
            ? 'border-gray-200 dark:border-gray-600' 
            : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
        }`}>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className={`text-lg font-semibold ${
                    employee.isActive 
                      ? 'text-gray-900 dark:text-white' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {employee.name}
                  </h3>
                  {!employee.isActive && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      Inativo
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2 mb-1">
                  {getRoleIcon(employee.role)}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(employee.role)}`}>
                    {getRoleLabel(employee.role)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  Setor: {employee.setor}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(employee)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
                {canDelete && employee.id !== user?.id && (
                  <button
                    onClick={() => handleDelete(employee.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                    title="Desativar"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                {employee.email}
              </div>

              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <User className="w-4 h-4 mr-2 text-gray-400" />
                Login: {employee.login}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-600 flex justify-between items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Criado em {formatDate(employee.createdAt)}
              </span>
              {employee.updatedAt > employee.createdAt && (
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  Atualizado em {formatDate(employee.updatedAt)}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmployeeList;