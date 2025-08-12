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
  const [isLoading, setIsLoading] = useState(true);
  const { isConnected, isConnecting, useLocalMode } = useDatabase();

  useEffect(() => {
    const initAuth = async () => {
      if (useLocalMode) {
        // Check localStorage for demo user
        const savedUser = localStorage.getItem('ct-user');
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            setUser(userData);
            setIsAuthenticated(true);
          } catch (error) {
            console.error('Error parsing saved user:', error);
            localStorage.removeItem('ct-user');
          }
        }
      } else if (isConnected) {
        // Check Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          try {
            const userData = await UserService.findById(session.user.id);
            if (userData) {
              setUser(userData);
              setIsAuthenticated(true);
            }
          } catch (error) {
            console.error('Error loading user data:', error);
          }
        }
      }
      setIsLoading(false);
    };

    if (!isConnecting) {
      initAuth();
    }
  }, [isConnected, isConnecting, useLocalMode]);

  useEffect(() => {
    if (!useLocalMode && isConnected) {
      // Listen for auth changes only in Supabase mode
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            try {
              const userData = await UserService.findById(session.user.id);
              if (userData) {
                setUser(userData);
                setIsAuthenticated(true);
              }
            } catch (error) {
              console.error('Error loading user on sign in:', error);
            }
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [useLocalMode, isConnected]);

  const login = async (loginOrEmail: string, password: string): Promise<boolean> => {
    try {
      if (!isConnected) {
        throw new Error('Database not connected');
      }

      if (useLocalMode) {
        // Local mode authentication
        const foundUser = await LocalUserService.findByLoginOrEmail(loginOrEmail);
        
        const validPasswords: Record<string, string> = {
          'admin': 'admin123',
          'joao': 'joao123',
          'maria': 'maria123',
          'carlos': 'carlos123'
        };
        
        if (foundUser && validPasswords[foundUser.login] === password) {
          setUser(foundUser);
          setIsAuthenticated(true);
          localStorage.setItem('ct-user', JSON.stringify(foundUser));
          return true;
        }
      } else {
        // Supabase authentication
        const foundUser = await UserService.findByLoginOrEmail(loginOrEmail);
        
        if (foundUser && foundUser.password === password && foundUser.isActive) {
          // Create a Supabase auth session
          const { data, error } = await supabase.auth.signInWithPassword({
            email: foundUser.email,
            password: password
          });

          if (error) {
            // If Supabase auth fails, try direct login
            console.warn('Supabase auth failed, using direct login:', error.message);
            const userData = await UserService.findById(foundUser.id);
            if (userData) {
              setUser(userData);
              setIsAuthenticated(true);
              return true;
            }
          } else if (data.user) {
            // Supabase auth successful
            const userData = await UserService.findById(data.user.id);
            if (userData) {
              setUser(userData);
              setIsAuthenticated(true);
              return true;
            }
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
      if (!useLocalMode) {
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('ct-user');
    }
  };

  // Show loading while initializing
  if (isLoading || isConnecting) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {isConnecting ? 'Conectando ao sistema...' : 'Carregando...'}
          </p>
        </div>
      </div>
    );
  }

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};