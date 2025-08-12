import React, { useState } from 'react';
import { Settings, Palette, Zap, Monitor, Eye, Gauge, Save } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

const SettingsPage: React.FC = () => {
  const { settings, updateTheme, updateSettings, toggleReducedMotion, toggleHighContrast, toggleCompactMode } = useTheme();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  
  const [localSettings, setLocalSettings] = useState({
    autoSave: true,
    notifications: true,
    soundEffects: false,
    dataRetention: 30,
    backupFrequency: 'weekly',
  });

  const handleSaveSettings = () => {
    addNotification({
      title: 'Configurações Salvas',
      message: 'Suas preferências foram salvas com sucesso.',
      type: 'success',
    });
  };

  const handleResetSettings = () => {
    if (window.confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
      updateSettings({
        theme: 'light',
        reducedMotion: false,
        highContrast: false,
        compactMode: false,
      });
      setLocalSettings({
        autoSave: true,
        notifications: true,
        soundEffects: false,
        dataRetention: 30,
        backupFrequency: 'weekly',
      });
      addNotification({
        title: 'Configurações Restauradas',
        message: 'As configurações foram restauradas para os valores padrão.',
        type: 'info',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações</h1>
          <p className="text-gray-600 dark:text-gray-400">Personalize sua experiência no sistema</p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleResetSettings}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Restaurar Padrão
          </button>
          <button
            onClick={handleSaveSettings}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Salvar</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aparência */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Palette className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Aparência</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Personalize o visual do sistema</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Tema */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Tema
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => updateTheme('light')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    settings.theme === 'light'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-white border border-gray-300 rounded"></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Claro</span>
                  </div>
                </button>
                <button
                  onClick={() => updateTheme('dark')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    settings.theme === 'dark'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gray-800 border border-gray-600 rounded"></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Escuro</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Opções de Acessibilidade */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Acessibilidade</h4>
              
              <label className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Eye className="w-4 h-4 text-gray-400" />
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Alto Contraste</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Melhora a legibilidade</p>
                  </div>
                </div>
                <button
                  onClick={toggleHighContrast}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.highContrast ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.highContrast ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </label>

              <label className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Monitor className="w-4 h-4 text-gray-400" />
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Modo Compacto</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Interface mais densa</p>
                  </div>
                </div>
                <button
                  onClick={toggleCompactMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.compactMode ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.compactMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </label>
            </div>
          </div>
        </div>

        {/* Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Zap className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Performance</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Otimize o desempenho do sistema</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <label className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Gauge className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Reduzir Animações</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Desativa efeitos visuais para melhor performance</p>
                </div>
              </div>
              <button
                onClick={toggleReducedMotion}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.reducedMotion ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-yellow-600 text-xs">💡</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Dicas de Performance</h4>
                  <ul className="text-xs text-yellow-700 dark:text-yellow-300 mt-2 space-y-1">
                    <li>• Ative "Reduzir Animações" em dispositivos mais lentos</li>
                    <li>• Use o modo compacto para economizar espaço na tela</li>
                    <li>• O tema escuro pode economizar bateria em telas OLED</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sistema */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Settings className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Sistema</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Configurações gerais do sistema</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <label className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Salvamento Automático</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Salva alterações automaticamente</p>
              </div>
              <button
                onClick={() => setLocalSettings(prev => ({ ...prev, autoSave: !prev.autoSave }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  localSettings.autoSave ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    localSettings.autoSave ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>

            <label className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Notificações</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Receber notificações do sistema</p>
              </div>
              <button
                onClick={() => setLocalSettings(prev => ({ ...prev, notifications: !prev.notifications }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  localSettings.notifications ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    localSettings.notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Retenção de Dados (dias)
              </label>
              <select
                value={localSettings.dataRetention}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, dataRetention: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value={7}>7 dias</option>
                <option value={30}>30 dias</option>
                <option value={90}>90 dias</option>
                <option value={365}>1 ano</option>
                <option value={-1}>Indefinido</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Frequência de Backup
              </label>
              <select
                value={localSettings.backupFrequency}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, backupFrequency: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="daily">Diário</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
                <option value="manual">Manual</option>
              </select>
            </div>
          </div>
        </div>

        {/* Informações do Usuário */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Informações da Conta</h3>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold">
                  {user?.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Cargo:</span>
                <p className="font-medium text-gray-900 dark:text-white capitalize">{user?.role}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Setor:</span>
                <p className="font-medium text-gray-900 dark:text-white capitalize">{user?.setor}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <button className="text-sm text-green-600 hover:text-green-700 dark:hover:text-green-400">
                Alterar Senha
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;