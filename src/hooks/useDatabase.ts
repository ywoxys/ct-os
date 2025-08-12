import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { seedLocalData } from '../utils/seedDatabase';

export const useDatabase = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useLocalMode, setUseLocalMode] = useState(false);

  useEffect(() => {
    const initializeDB = async () => {
      setIsConnecting(true);
      try {
        // Check if Supabase is properly configured
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey || 
            supabaseUrl.includes('your-project') || 
            supabaseKey.includes('your-anon-key')) {
          throw new Error('Supabase not configured - using local mode');
        }

        // Test connection by trying to fetch from users table
        const { error: testError } = await supabase
          .from('users')
          .select('id')
          .limit(1);

        if (testError) {
          if (testError.code === 'PGRST116' || testError.message.includes('404')) {
            throw new Error('Tables not found - using local mode');
          }
          throw testError;
        }

        setIsConnected(true);
        setUseLocalMode(false);
        setError(null);
      } catch (err: any) {
        console.error('Database connection error:', err);
        
        // Use local mode as fallback
        console.log('Switching to local mode...');
        setUseLocalMode(true);
        setIsConnected(true);
        setError(null);
        
        // Seed local data
        await seedLocalData();
      } finally {
        setIsConnecting(false);
      }
    };

    initializeDB();
  }, []);

  return { isConnected, isConnecting, error, useLocalMode };
};