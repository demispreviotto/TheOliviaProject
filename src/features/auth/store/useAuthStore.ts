import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../../api/supabase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitialLoading: boolean;
  setUser: (user: User | null) => void;
  initialize: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({ // Added 'get' here
      user: null,
      isAuthenticated: false,
      isInitialLoading: true,

      setUser: (user) => 
        set({ 
          user, 
          isAuthenticated: !!user, 
          isInitialLoading: false
        }, false, 'auth/setUser'),

      initialize: async () => {
        try {
          // 1. Setup listener
          supabase.auth.onAuthStateChange((_event, session) => {
            get().setUser(session?.user ?? null);
          });

          // 2. Await session
          const { data: { session } } = await supabase.auth.getSession();
          get().setUser(session?.user ?? null);
        } catch (error) {
          console.error("Auth init failed", error);
          set({ isInitialLoading: false });
        }
      },
      logout: async () => {
        await supabase.auth.signOut();
      },
    }),
    { name: 'AuthStore' }
  )
);