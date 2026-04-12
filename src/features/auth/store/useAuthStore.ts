import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitialLoading: boolean;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => 
        set({ 
          user, 
          isAuthenticated: !!user, 
          isInitialLoading: false
        }, false, 'auth/setUser'),
    }),
    { name: 'AuthStore' }
  )
);