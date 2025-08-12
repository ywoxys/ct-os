import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContext as AuthContextType } from '../types';
import { UserService } from '../services/userService';
import { LocalUserService } from '../services/localStorageService';
import { supabase } from '../lib/supabase';
import { useDatabase } from '../hooks/useDatabase';

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const { isConnected, isConnecting, useLocalMode } = useDatabase();

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentSession(session);
        // Load user data from our users table
        const userData = await UserService.findById(session.user.id);
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        }
      }
    };

    if (isConnected) {
      checkSession();
    }
  }, [isConnected]);

  useEffect(() => {
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setCurrentSession(session);
          const userData = await UserService.findById(session.user.id);
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
          }
        } else if (event === 'SIGNED_OUT') {
          setCurrentSession(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const createAnonymousSession = async (userData: User) => {
    // Create a temporary anonymous session for demo purposes
    const mockSession = {
      user: { id: userData.id },
      access_token: 'demo-token',
      refresh_token: 'demo-refresh',
    };
    
    setCurrentSession(mockSession);
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('ct-user', JSON.stringify(userData));
  };

  const login = async (loginOrEmail: string, password: string): Promise<boolean> => {
    try {
      if (!isConnected) {
        throw new Error('Database not connected');
      }

      let foundUser;
      
      if (useLocalMode) {
        // Use local storage for demo
        foundUser = await LocalUserService.findByLoginOrEmail(loginOrEmail);
        
        // Simple password validation for demo
        const validPasswords: Record<string, string> = {
          'admin': 'admin123',
          'joao': 'joao123',
          'maria': 'maria123'
        };
        
        if (foundUser && validPasswords[foundUser.login] === password) {
          await createAnonymousSession(foundUser);
          return true;
        }
      } else {
        // Use Supabase for production
        foundUser = await UserService.findByLoginOrEmail(loginOrEmail);
        
        if (foundUser && foundUser.password === password && foundUser.is_active) {
          const userData = await UserService.findById(foundUser.id);
          if (userData) {
            await createAnonymousSession(userData);
            return true;
          }
        }
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Sign out from Supabase if there's a real session
      if (currentSession && currentSession.access_token !== 'demo-token') {
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setCurrentSession(null);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('ct-user');
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated,
  };

  // Mostrar loading enquanto conecta ao banco
  if (isConnecting) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Conectando ao banco de dados...</p>
      </div>
    </div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};