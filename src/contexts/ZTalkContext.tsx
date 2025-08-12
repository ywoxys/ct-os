import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ZTalkContact, ZTalkConversation, ZTalkMessage, ZTalkQueue, ZTalkBroadcast } from '../types';
import { useAuth } from './AuthContext';

interface ZTalkContextType {
  contacts: ZTalkContact[];
  conversations: ZTalkConversation[];
  messages: ZTalkMessage[];
  queues: ZTalkQueue[];
  broadcasts: ZTalkBroadcast[];
  
  // Contacts
  addContact: (contact: Omit<ZTalkContact, 'id'>) => void;
  updateContact: (id: string, updates: Partial<ZTalkContact>) => void;
  deleteContact: (id: string) => void;
  
  // Conversations
  createConversation: (contactId: string) => void;
  assignConversation: (conversationId: string, userId: string) => void;
  updateConversationStatus: (conversationId: string, status: ZTalkConversation['status']) => void;
  closeConversation: (conversationId: string) => void;
  
  // Messages
  sendMessage: (conversationId: string, message: string, type?: ZTalkMessage['type']) => void;
  getConversationMessages: (conversationId: string) => ZTalkMessage[];
  
  // Queues
  createQueue: (queue: Omit<ZTalkQueue, 'id'>) => void;
  updateQueue: (id: string, updates: Partial<ZTalkQueue>) => void;
  deleteQueue: (id: string) => void;
  
  // Broadcasts
  createBroadcast: (broadcast: Omit<ZTalkBroadcast, 'id' | 'createdAt' | 'stats'>) => void;
  sendBroadcast: (broadcastId: string) => void;
  getBroadcastStats: (broadcastId: string) => ZTalkBroadcast['stats'];
}

const ZTalkContext = createContext<ZTalkContextType | null>(null);

interface ZTalkProviderProps {
  children: ReactNode;
}

// Local storage functions
const getContacts = (): ZTalkContact[] => {
  const stored = localStorage.getItem('ct-ztalk-contacts');
  if (stored) {
    const contacts = JSON.parse(stored);
    return contacts.map((contact: any) => ({
      ...contact,
      lastInteraction: contact.lastInteraction ? new Date(contact.lastInteraction) : undefined,
    }));
  }
  return [];
};

const setContacts = (contacts: ZTalkContact[]): void => {
  localStorage.setItem('ct-ztalk-contacts', JSON.stringify(contacts));
};

const getConversations = (): ZTalkConversation[] => {
  const stored = localStorage.getItem('ct-ztalk-conversations');
  if (stored) {
    const conversations = JSON.parse(stored);
    return conversations.map((conv: any) => ({
      ...conv,
      createdAt: new Date(conv.createdAt),
      updatedAt: new Date(conv.updatedAt),
      lastMessageAt: conv.lastMessageAt ? new Date(conv.lastMessageAt) : undefined,
    }));
  }
  return [];
};

const setConversations = (conversations: ZTalkConversation[]): void => {
  localStorage.setItem('ct-ztalk-conversations', JSON.stringify(conversations));
};

const getMessages = (): ZTalkMessage[] => {
  const stored = localStorage.getItem('ct-ztalk-messages');
  if (stored) {
    const messages = JSON.parse(stored);
    return messages.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }));
  }
  return [];
};

const setMessages = (messages: ZTalkMessage[]): void => {
  localStorage.setItem('ct-ztalk-messages', JSON.stringify(messages));
};

const getQueues = (): ZTalkQueue[] => {
  const stored = localStorage.getItem('ct-ztalk-queues');
  return stored ? JSON.parse(stored) : [];
};

const setQueues = (queues: ZTalkQueue[]): void => {
  localStorage.setItem('ct-ztalk-queues', JSON.stringify(queues));
};

const getBroadcasts = (): ZTalkBroadcast[] => {
  const stored = localStorage.getItem('ct-ztalk-broadcasts');
  if (stored) {
    const broadcasts = JSON.parse(stored);
    return broadcasts.map((broadcast: any) => ({
      ...broadcast,
      scheduledFor: broadcast.scheduledFor ? new Date(broadcast.scheduledFor) : undefined,
      createdAt: new Date(broadcast.createdAt),
      sentAt: broadcast.sentAt ? new Date(broadcast.sentAt) : undefined,
    }));
  }
  return [];
};

const setBroadcasts = (broadcasts: ZTalkBroadcast[]): void => {
  localStorage.setItem('ct-ztalk-broadcasts', JSON.stringify(broadcasts));
};

export const ZTalkProvider: React.FC<ZTalkProviderProps> = ({ children }) => {
  const [contacts, setContactsState] = useState<ZTalkContact[]>([]);
  const [conversations, setConversationsState] = useState<ZTalkConversation[]>([]);
  const [messages, setMessagesState] = useState<ZTalkMessage[]>([]);
  const [queues, setQueuesState] = useState<ZTalkQueue[]>([]);
  const [broadcasts, setBroadcastsState] = useState<ZTalkBroadcast[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const loadData = () => {
      setContactsState(getContacts());
      setConversationsState(getConversations());
      setMessagesState(getMessages());
      setQueuesState(getQueues());
      setBroadcastsState(getBroadcasts());
    };

    if (user) {
      loadData();
    }
  }, [user]);

  const refreshData = () => {
    setContactsState(getContacts());
    setConversationsState(getConversations());
    setMessagesState(getMessages());
    setQueuesState(getQueues());
    setBroadcastsState(getBroadcasts());
  };

  // Contact methods
  const addContact = (contactData: Omit<ZTalkContact, 'id'>) => {
    const newContact: ZTalkContact = {
      ...contactData,
      id: Date.now().toString(),
    };

    const contacts = getContacts();
    contacts.push(newContact);
    setContacts(contacts);
    refreshData();
  };

  const updateContact = (id: string, updates: Partial<ZTalkContact>) => {
    const contacts = getContacts();
    const index = contacts.findIndex(c => c.id === id);
    
    if (index !== -1) {
      contacts[index] = { ...contacts[index], ...updates };
      setContacts(contacts);
      refreshData();
    }
  };

  const deleteContact = (id: string) => {
    const contacts = getContacts();
    const filteredContacts = contacts.filter(c => c.id !== id);
    setContacts(filteredContacts);
    refreshData();
  };

  // Conversation methods
  const createConversation = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;

    const newConversation: ZTalkConversation = {
      id: Date.now().toString(),
      contactId,
      contactName: contact.name,
      contactPhone: contact.phone,
      status: 'open',
      priority: 'medium',
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const conversations = getConversations();
    conversations.push(newConversation);
    setConversations(conversations);
    refreshData();
  };

  const assignConversation = (conversationId: string, userId: string) => {
    const conversations = getConversations();
    const index = conversations.findIndex(c => c.id === conversationId);
    
    if (index !== -1) {
      conversations[index] = {
        ...conversations[index],
        assignedTo: userId,
        assignedToName: user?.name || 'Usuário',
        updatedAt: new Date(),
      };
      setConversations(conversations);
      refreshData();
    }
  };

  const updateConversationStatus = (conversationId: string, status: ZTalkConversation['status']) => {
    const conversations = getConversations();
    const index = conversations.findIndex(c => c.id === conversationId);
    
    if (index !== -1) {
      conversations[index] = {
        ...conversations[index],
        status,
        updatedAt: new Date(),
      };
      setConversations(conversations);
      refreshData();
    }
  };

  const closeConversation = (conversationId: string) => {
    updateConversationStatus(conversationId, 'closed');
  };

  // Message methods
  const sendMessage = (conversationId: string, message: string, type: ZTalkMessage['type'] = 'text') => {
    if (!user) return;

    const newMessage: ZTalkMessage = {
      id: Date.now().toString(),
      conversationId,
      senderId: user.id,
      senderName: user.name,
      message,
      type,
      direction: 'outbound',
      timestamp: new Date(),
      status: 'sent',
    };

    const messages = getMessages();
    messages.push(newMessage);
    setMessages(messages);

    // Update conversation last message
    const conversations = getConversations();
    const convIndex = conversations.findIndex(c => c.id === conversationId);
    if (convIndex !== -1) {
      conversations[convIndex] = {
        ...conversations[convIndex],
        lastMessage: message,
        lastMessageAt: new Date(),
        updatedAt: new Date(),
      };
      setConversations(conversations);
    }

    refreshData();
  };

  const getConversationMessages = (conversationId: string): ZTalkMessage[] => {
    return messages.filter(m => m.conversationId === conversationId);
  };

  // Queue methods
  const createQueue = (queueData: Omit<ZTalkQueue, 'id'>) => {
    const newQueue: ZTalkQueue = {
      ...queueData,
      id: Date.now().toString(),
    };

    const queues = getQueues();
    queues.push(newQueue);
    setQueues(queues);
    refreshData();
  };

  const updateQueue = (id: string, updates: Partial<ZTalkQueue>) => {
    const queues = getQueues();
    const index = queues.findIndex(q => q.id === id);
    
    if (index !== -1) {
      queues[index] = { ...queues[index], ...updates };
      setQueues(queues);
      refreshData();
    }
  };

  const deleteQueue = (id: string) => {
    const queues = getQueues();
    const filteredQueues = queues.filter(q => q.id !== id);
    setQueues(filteredQueues);
    refreshData();
  };

  // Broadcast methods
  const createBroadcast = (broadcastData: Omit<ZTalkBroadcast, 'id' | 'createdAt' | 'stats'>) => {
    if (!user) return;

    const newBroadcast: ZTalkBroadcast = {
      ...broadcastData,
      id: Date.now().toString(),
      createdBy: user.id,
      createdAt: new Date(),
      stats: {
        sent: 0,
        delivered: 0,
        read: 0,
        failed: 0,
      },
    };

    const broadcasts = getBroadcasts();
    broadcasts.push(newBroadcast);
    setBroadcasts(broadcasts);
    refreshData();
  };

  const sendBroadcast = (broadcastId: string) => {
    const broadcasts = getBroadcasts();
    const index = broadcasts.findIndex(b => b.id === broadcastId);
    
    if (index !== -1) {
      broadcasts[index] = {
        ...broadcasts[index],
        status: 'sending',
        sentAt: new Date(),
      };
      setBroadcasts(broadcasts);
      
      // Simulate sending process
      setTimeout(() => {
        broadcasts[index] = {
          ...broadcasts[index],
          status: 'sent',
          stats: {
            sent: broadcasts[index].recipients.length,
            delivered: Math.floor(broadcasts[index].recipients.length * 0.95),
            read: Math.floor(broadcasts[index].recipients.length * 0.7),
            failed: Math.floor(broadcasts[index].recipients.length * 0.05),
          },
        };
        setBroadcasts(broadcasts);
        refreshData();
      }, 3000);
      
      refreshData();
    }
  };

  const getBroadcastStats = (broadcastId: string): ZTalkBroadcast['stats'] => {
    const broadcast = broadcasts.find(b => b.id === broadcastId);
    return broadcast?.stats || { sent: 0, delivered: 0, read: 0, failed: 0 };
  };

  const value: ZTalkContextType = {
    contacts,
    conversations,
    messages,
    queues,
    broadcasts,
    addContact,
    updateContact,
    deleteContact,
    createConversation,
    assignConversation,
    updateConversationStatus,
    closeConversation,
    sendMessage,
    getConversationMessages,
    createQueue,
    updateQueue,
    deleteQueue,
    createBroadcast,
    sendBroadcast,
    getBroadcastStats,
  };

  return <ZTalkContext.Provider value={value}>{children}</ZTalkContext.Provider>;
};

export const useZTalk = () => {
  const context = useContext(ZTalkContext);
  if (!context) {
    throw new Error('useZTalk deve ser usado dentro de um ZTalkProvider');
  }
  return context;
};