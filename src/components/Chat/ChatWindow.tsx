import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, Users, Hash, X } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { ChatMessage, ChatChannel } from '../../types';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ isOpen, onClose }) => {
  const { 
    messages, 
    channels, 
    activeChannel, 
    sendMessage, 
    setActiveChannel, 
    getChannelMessages,
    createChannel,
    joinChannel 
  } = useChat();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [showChannels, setShowChannels] = useState(true);
  const [newChannelName, setNewChannelName] = useState('');
  const [showNewChannelForm, setShowNewChannelForm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChannel]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChannel) return;

    sendMessage(newMessage, undefined, activeChannel.id);
    setNewMessage('');
  };

  const handleCreateChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    createChannel(newChannelName);
    setNewChannelName('');
    setShowNewChannelForm(false);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const currentMessages = activeChannel ? getChannelMessages(activeChannel.id) : [];

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <h3 className="font-medium text-gray-900 dark:text-white">
            {activeChannel ? `#${activeChannel.name}` : 'Chat Interno'}
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowChannels(!showChannels)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title="Canais"
          >
            <Hash className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {showChannels && (
          <div className="w-32 bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600 flex flex-col">
            <div className="p-2 border-b border-gray-200 dark:border-gray-600">
              <button
                onClick={() => setShowNewChannelForm(true)}
                className="w-full text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
              >
                + Canal
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setActiveChannel(channel)}
                  className={`w-full text-left px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-600 ${
                    activeChannel?.id === channel.id 
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  #{channel.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {!activeChannel ? (
              <div className="text-center text-gray-500 dark:text-gray-400 text-sm mt-8">
                Selecione um canal para começar a conversar
              </div>
            ) : currentMessages.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 text-sm mt-8">
                Nenhuma mensagem ainda. Seja o primeiro a enviar!
              </div>
            ) : (
              currentMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      message.senderId === user?.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white'
                    }`}
                  >
                    {message.senderId !== user?.id && (
                      <div className="text-xs opacity-75 mb-1">{message.senderName}</div>
                    )}
                    <div>{message.message}</div>
                    <div className="text-xs opacity-75 mt-1">
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          {activeChannel && (
            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Mensagem para #${activeChannel.name}`}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* New Channel Modal */}
      {showNewChannelForm && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg w-64">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Novo Canal</h4>
            <form onSubmit={handleCreateChannel}>
              <input
                type="text"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder="Nome do canal"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNewChannelForm(false)}
                  className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;