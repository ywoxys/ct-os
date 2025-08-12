import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ClientProvider } from './contexts/ClientContext';
import { CashProvider } from './contexts/CashContext';
import { EmployeeProvider } from './contexts/EmployeeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ChatProvider } from './contexts/ChatContext';
import { ZTalkProvider } from './contexts/ZTalkContext';
import { useDatabase } from './hooks/useDatabase';
import LoginForm from './components/Auth/LoginForm';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './pages/Dashboard';
import ClientsPage from './pages/ClientsPage';
import CashPage from './pages/CashPage';
import EmployeesPage from './pages/EmployeesPage';
import ChatWindow from './components/Chat/ChatWindow';
import ReportsPage from './components/Reports/ReportsPage';
import ZTalkPage from './components/ZTalk/ZTalkPage';

const IntegrationPage = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Integração</h2>
      <p className="text-gray-600 dark:text-gray-400">Módulo de integração com planilhas em desenvolvimento...</p>
    </div>
);

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const { isConnected, isConnecting, error, useLocalMode } = useDatabase();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (isConnected) {
      if (useLocalMode) {
        // seedLocalData();
      } else {
        // seedDatabase();
      }
    }
  }, [isConnected, useLocalMode]);

  if (isConnecting) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Inicializando sistema...</p>
          </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Erro de Inicialização</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Não foi possível inicializar o sistema.</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-3 rounded">{error}</p>
            <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard':
        return 'Dashboard';
      case 'clients':
        return 'Clientes';
      case 'employees':
        return 'Funcionários';
      case 'cash':
        return 'Caixa';
      case 'chat':
        return 'Chat Interno';
      case 'reports':
        return 'Relatórios';
      case 'ztalk':
        return 'ZTalk';
      case 'integration':
        return 'Integração';
      default:
        return 'Sistema CT';
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'clients':
        return <ClientsPage />;
      case 'employees':
        return <EmployeesPage />;
      case 'cash':
        return <CashPage />;
      case 'chat':
        setChatOpen(true);
        setCurrentPage('dashboard');
        return <Dashboard />;
      case 'reports':
        return <ReportsPage />;
      case 'ztalk':
        return <ZTalkPage />;
      case 'integration':
        return <IntegrationPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
            <div
                className="fixed inset-0 z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
            >
              <div className="absolute inset-0 bg-black opacity-50" />
            </div>
        )}

        {/* Sidebar */}
        <div
            className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
          <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
              title={getPageTitle()}
              onMenuClick={() => setSidebarOpen(true)}
              showSearch={false}
          />
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
            {useLocalMode && (
                <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mr-3">
                      <span className="text-yellow-600 dark:text-yellow-400 text-sm">⚠️</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Modo Demonstração</h3>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Sistema rodando em modo local. Para usar o Supabase, configure as variáveis de ambiente.
                      </p>
                    </div>
                  </div>
                </div>
            )}
            {renderPage()}
          </main>
        </div>
        
        {/* Chat Window */}
        <ChatWindow isOpen={chatOpen} onClose={() => setChatOpen(false)} />
      </div>
  );
};

function App() {
  return (
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <ChatProvider>
              <ZTalkProvider>
                <ClientProvider>
                  <CashProvider>
                    <EmployeeProvider>
                      <AppContent />
                    </EmployeeProvider>
                  </CashProvider>
                </ClientProvider>
              </ZTalkProvider>
            </ChatProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
  );
}

export default App;
