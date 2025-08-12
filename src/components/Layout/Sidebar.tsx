import React from 'react';
import { 
  Users, 
  UserCheck, 
  Calculator, 
  FileSpreadsheet, 
  Home,
  LogOut,
  MessageSquare,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  requiredRole?: string[];
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const { user, logout } = useAuth();

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Home className="w-5 h-5" />,
    },
    {
      id: 'clients',
      label: 'Clientes',
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: 'employees',
      label: 'Funcionários',
      icon: <UserCheck className="w-5 h-5" />,
      requiredRole: ['administrador-all', 'administrador'],
    },
    {
      id: 'cash',
      label: 'Caixa',
      icon: <Calculator className="w-5 h-5" />,
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: <MessageSquare className="w-5 h-5" />,
    },
    {
      id: 'reports',
      label: 'Relatórios',
      icon: <BarChart3 className="w-5 h-5" />,
      requiredRole: ['administrador-all', 'administrador'],
    },
    {
      id: 'ztalk',
      label: 'ZTalk',
      icon: <MessageSquare className="w-5 h-5" />,
      requiredRole: ['administrador-all', 'administrador'],
    },
    {
      id: 'integration',
      label: 'Integração',
      icon: <FileSpreadsheet className="w-5 h-5" />,
      requiredRole: ['administrador-all', 'administrador'],
    },
  ];

  const canAccessItem = (item: MenuItem): boolean => {
    if (!item.requiredRole) return true;
    if (!user) return false;
    return item.requiredRole.includes(user.role);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'administrador-all':
        return 'bg-red-100 text-red-800';
      case 'administrador':
        return 'bg-blue-100 text-blue-800';
      case 'whatsapp':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Sistema CT</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Gestão de Clientes</p>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {user?.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.setor}</p>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(user?.role || '')}`}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          if (!canAccessItem(item)) return null;

          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors duration-200 ${
                currentPage === item.id
                  ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-r-2 border-blue-500'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;