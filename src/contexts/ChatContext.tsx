import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ChatMessage, ChatChannel } from '../types';
import { useAuth } from './AuthContext';

interface ChatContextType {
  messages: ChatMessage[];
  channels: ChatChannel[];
  activeChannel: ChatChannel | null;
  unreadCount: number;
  sendMessage: (message: string, receiverId?: string, channelId?: string) => void;
  markAsRead: (messageId: string) => void;
  createChannel: (name: string, description?: string, type?: 'public' | 'private') => void;
  joinChannel: (channelId: string) => void;
  leaveChannel: (channelId: string) => void;
  setActiveChannel: (channel: ChatChannel | null) => void;
  getChannelMessages: (channelId: string) => ChatMessage[];
  getPrivateMessages: (userId: string) => ChatMessage[];
}

const ChatContext = createContext<ChatContextType | null>(null);

interface ChatProviderProps {
  children: ReactNode;
}

// Local storage functions
const getMessages = (): ChatMessage[] => {
  const stored = localStorage.getItem('ct-chat-messages');
  if (stored) {
    const messages = JSON.parse(stored);
    return messages.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }));
  }
  return [];
};

const setMessages = (messages: ChatMessage[]): void => {
  localStorage.setItem('ct-chat-messages', JSON.stringify(messages));
};

const getChannels = (): ChatChannel[] => {
  const stored = localStorage.getItem('ct-chat-channels');
  if (stored) {
    const channels = JSON.parse(stored);
    return channels.map((channel: any) => ({
      ...channel,
      createdAt: new Date(channel.createdAt),
    }));
  }
  return [];
};

const setChannels = (channels: ChatChannel[]): void => {
  localStorage.setItem('ct-chat-channels', JSON.stringify(channels));
};

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [messages, setMessagesState] = useState<ChatMessage[]>([]);
  const [channels, setChannelsState] = useState<ChatChannel[]>([]);
  const [activeChannel, setActiveChannel] = useState<ChatChannel | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadData = () => {
      const msgs = getMessages();
      const chns = getChannels();
      
      setMessagesState(msgs);
      setChannelsState(chns);

      // Create default general channel if none exist
      if (chns.length === 0 && user) {
        const generalChannel: ChatChannel = {
          id: 'general',
          name: 'Geral',
          description: 'Canal geral para toda a equipe',
          type: 'public',
          members: [user.id],
          createdBy: user.id,
          createdAt: new Date(),
        };
        
        const newChannels = [generalChannel];
        setChannels(newChannels);
        setChannelsState(newChannels);
        setActiveChannel(generalChannel);
      }
    };

    if (user) {
      loadData();
    }
  }, [user]);

  const refreshData = () => {
    setMessagesState(getMessages());
    setChannelsState(getChannels());
  };

  const sendMessage = (message: string, receiverId?: string, channelId?: string) => {
    if (!user) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: user.id,
      senderName: user.name,
      receiverId,
      message,
      type: channelId ? 'group' : receiverId ? 'private' : 'broadcast',
      channelId,
      timestamp: new Date(),
      isRead: false,
    };

    const msgs = getMessages();
    msgs.push(newMessage);
    setMessages(msgs);
    refreshData();
  };

  const markAsRead = (messageId: string) => {
    const msgs = getMessages();
    const index = msgs.findIndex(m => m.id === messageId);
    
    if (index !== -1) {
      msgs[index] = { ...msgs[index], isRead: true };
      setMessages(msgs);
      refreshData();
    }
  };

  const createChannel = (name: string, description?: string, type: 'public' | 'private' = 'public') => {
    if (!user) return;

    const newChannel: ChatChannel = {
      id: Date.now().toString(),
      name,
      description,
      type,
      members: [user.id],
      createdBy: user.id,
      createdAt: new Date(),
    };

    const chns = getChannels();
    chns.push(newChannel);
    setChannels(chns);
    refreshData();
  };

  const joinChannel = (channelId: string) => {
    if (!user) return;

    const chns = getChannels();
    const index = chns.findIndex(c => c.id === channelId);
    
    if (index !== -1 && !chns[index].members.includes(user.id)) {
      chns[index] = {
        ...chns[index],
        members: [...chns[index].members, user.id],
      };
      setChannels(chns);
      refreshData();
    }
  };

  const leaveChannel = (channelId: string) => {
    if (!user) return;

    const chns = getChannels();
    const index = chns.findIndex(c => c.id === channelId);
    
    if (index !== -1) {
      chns[index] = {
        ...chns[index],
        members: chns[index].members.filter(id => id !== user.id),
      };
      setChannels(chns);
      refreshData();
      
      if (activeChannel?.id === channelId) {
        setActiveChannel(null);
      }
    }
  };

  const getChannelMessages = (channelId: string): ChatMessage[] => {
    return messages.filter(m => m.channelId === channelId);
  };

  const getPrivateMessages = (userId: string): ChatMessage[] => {
    if (!user) return [];
    
    return messages.filter(m => 
      (m.senderId === user.id && m.receiverId === userId) ||
      (m.senderId === userId && m.receiverId === user.id)
    );
  };

  const unreadCount = messages.filter(m => 
    !m.isRead && m.senderId !== user?.id
  ).length;

  const value: ChatContextType = {
    messages,
    channels,
    activeChannel,
    unreadCount,
    sendMessage,
    markAsRead,
    createChannel,
    joinChannel,
    leaveChannel,
    setActiveChannel,
    getChannelMessages,
    getPrivateMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat deve ser usado dentro de um ChatProvider');
  }
  return context;
};