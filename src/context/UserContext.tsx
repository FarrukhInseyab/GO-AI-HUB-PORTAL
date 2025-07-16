import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { getCurrentUser, signOut as authSignOut } from '../lib/auth';
import type { User } from '../types';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('UserProvider: Setting up auth state listener');
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      console.log('UserProvider: Loading current user...');
      
      // Add timeout and better error handling
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('User loading timeout')), 8000);
      });
      
      const userPromise = getCurrentUser();
      
      try {
        const user = await Promise.race([userPromise, timeoutPromise]) as User | null;
        setUser(user);
      } catch (timeoutError) {
        console.warn('User loading timed out, continuing without auth');
        setUser(null);
      }
      setUser(currentUser);
    } catch (error) {
      console.warn('Error loading user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('UserProvider: Signing out user');
      await authSignOut();
      setUser(null);
      console.log('UserProvider: User signed out successfully');
    } catch (error) {
      console.error('UserProvider: Error signing out:', error);
      throw error;
    }
  };

  // Update user state when setUser is called
  const handleSetUser = (newUser: User | null) => {
    console.log('UserProvider: Setting user:', newUser);
    setUser(newUser);
    setLoading(false);
  };

  return (
    <UserContext.Provider value={{ user, setUser: handleSetUser, loading, signOut }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};