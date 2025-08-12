import React from 'react';
import { Users, UserCheck, TrendingUp } from 'lucide-react'; // removi History pois não será mais usado
import { useClients } from '../../contexts/ClientContext';
import { useEmployees } from '../../contexts/EmployeeContext';

const DashboardStats: React.FC = () => {
  const { clients } = useClients();
  const { employees } = useEmployees();

  const stats = [
    {
      name: 'Total de Clientes',
      value: clients.length.toString(),
      icon: Users,
      color: 'bg-blue-500',
      trend: '+12%',
    },
    {
      name: 'Novos esta semana',
      value: clients.filter(c => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(c.createdAt) > weekAgo;
      }).length.toString(),
      icon: TrendingUp,
      color: 'bg-green-500',
      trend: '+5%',
    },
    {
      name: 'Funcionários',
      value: employees.filter(e => e.isActive).length.toString(),
      icon: UserCheck,
      color: 'bg-purple-500',
      trend: '+2%',
    },
  ];

  return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium mt-2">
                    {stat.trend} vs mês anterior
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
        ))}
      </div>
  );
};

export default DashboardStats;
