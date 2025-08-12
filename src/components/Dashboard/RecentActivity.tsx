import React from 'react';

const RecentActivity: React.FC = () => {
  return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center mb-4">
          Atividades Recentes
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Módulo de atividades recentes está desativado.
        </p>
      </div>
  );
};

export default RecentActivity;
