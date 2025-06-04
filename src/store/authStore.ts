import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import localforage from 'localforage';
import { useUserStore } from './userStore';

export type UserRole = 'admin' | 'receptionist' | 'technician' | 'warehouse' | 'detailing' | 'accountant';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  jobDescription?: string;
  settings?: {
    sidebarOpen: boolean;
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (user: User) => void;
  updateUserSettings: (settings: Partial<User['settings']>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      
      login: async (username: string, password: string) => {
        const user = useUserStore.getState().getUser(username, password);
        
        if (user) {
          set({ 
            user: {
              ...user,
              settings: {
                sidebarOpen: true,
                ...user.settings
              }
            }, 
            isAuthenticated: true 
          });
          return { success: true };
        }
        
        return { 
          success: false, 
          message: 'نام کاربری یا رمز عبور اشتباه است' 
        };
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      
      updateUser: (updatedUser: User) => {
        set({ user: updatedUser });
      },

      updateUserSettings: (settings: Partial<User['settings']>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              settings: {
                ...currentUser.settings,
                ...settings
              }
            }
          });
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: {
        getItem: async (name) => {
          const value = await localforage.getItem(name);
          return value || null;
        },
        setItem: async (name, value) => {
          await localforage.setItem(name, value);
        },
        removeItem: async (name) => {
          await localforage.removeItem(name);
        },
      },
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);