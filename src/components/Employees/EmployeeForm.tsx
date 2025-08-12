import React, { useState } from 'react';
import { X, Save, User } from 'lucide-react';
import { Employee, UserRole, Setor } from '../../types';
import { useEmployees } from '../../contexts/EmployeeContext';

interface EmployeeFormProps {
  employee?: Employee;
  onClose: () => void;
  onSave: () => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ employee, onClose, onSave }) => {
  const { addEmployee, updateEmployee } = useEmployees();
  const isEditing = !!employee;

  const [formData, setFormData] = useState({
    name: employee?.name || '',
    email: employee?.email || '',
    role: employee?.role || 'funcionario' as UserRole,
    setor: employee?.setor || 'geral' as Setor,
    login: employee?.login || '',
    isActive: employee?.isActive ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const roles: { value: UserRole; label: string }[] = [
    { value: 'funcionario', label: 'Funcionário' },
    { value: 'administrador', label: 'Administrador' },
    { value: 'administrador-all', label: 'Administrador Geral' },
  ];

  const setores: { value: Setor; label: string }[] = [
    { value: 'geral', label: 'Geral' },
    { value: 'adimplencia', label: 'Adimplência' },
    { value: 'homologacao', label: 'Homologação' },
    { value: 'vendas', label: 'Vendas' },
    { value: 'recepcao', label: 'Recepção' },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!formData.login.trim()) {
      newErrors.login = 'Login é obrigatório';
    } else if (formData.login.length < 3) {
      newErrors.login = 'Login deve ter pelo menos 3 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: finalValue,
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const submitData = async () => {
      try {
        if (isEditing && employee) {
          await updateEmployee(employee.id, formData);
        } else {
          await addEmployee(formData);
        }
        onSave();
        onClose();
      } catch (error) {
        console.error('Error saving employee:', error);
        // You could add error handling here
      }
    };

    submitData();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEditing ? 'Editar Funcionário' : 'Novo Funcionário'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome Completo *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Digite o nome completo"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              E-mail *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.email ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="email@exemplo.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Login *
            </label>
            <input
              type="text"
              name="login"
              value={formData.login}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.login ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Login do usuário"
            />
            {errors.login && (
              <p className="text-red-500 text-sm mt-1">{errors.login}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cargo *
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Setor *
            </label>
            <select
              name="setor"
              value={formData.setor}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {setores.map((setor) => (
                <option key={setor.value} value={setor.value}>
                  {setor.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Funcionário ativo
            </label>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Salvar Alterações' : 'Cadastrar Funcionário'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;