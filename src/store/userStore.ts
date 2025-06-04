import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserPermissions {
  canViewReceptions: boolean;
  canCreateTask: boolean;
  canCreateReception: boolean;
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: string;
  jobDescription?: string;
  active: boolean;
  permissions: UserPermissions;
}

interface UserStore {
  users: User[];
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  getUser: (username: string, password: string) => User | null;
}

// Mock users for demo
const INITIAL_USERS: User[] = [
  {
    id: '1',
    username: 'admin',
    name: 'مدیر سیستم',
    role: 'admin',
    jobDescription: 'مدیریت کامل سیستم، تنظیمات و کاربران',
    active: true,
    permissions: {
      canViewReceptions: true,
      canCreateTask: true,
      canCreateReception: true
    }
  },
  {
    id: '2',
    username: 'tech1',
    name: 'علی تکنسین',
    role: 'technician',
    jobDescription: 'تعمیر و نگهداری خودرو، ثبت گزارش تعمیرات',
    active: true,
    permissions: {
      canViewReceptions: false,
      canCreateTask: false,
      canCreateReception: false
    }
  },
  {
    id: '3',
    username: 'reception1',
    name: 'محمد پذیرش',
    role: 'receptionist',
    jobDescription: 'پذیرش خودرو، ثبت اطلاعات مشتری، ایجاد وظایف',
    active: true,
    permissions: {
      canViewReceptions: true,
      canCreateTask: true,
      canCreateReception: true
    }
  }
];

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      users: INITIAL_USERS,
      
      addUser: (user) => set((state) => ({
        users: [...state.users, { 
          ...user, 
          id: Date.now().toString(),
          permissions: user.role === 'receptionist' ? {
            canViewReceptions: true,
            canCreateTask: true,
            canCreateReception: true
          } : user.permissions
        }]
      })),
      
      updateUser: (id, user) => set((state) => ({
        users: state.users.map(u => {
          if (u.id === id) {
            // If updating to receptionist role, set fixed permissions
            if (user.role === 'receptionist') {
              return {
                ...u,
                ...user,
                permissions: {
                  canViewReceptions: true,
                  canCreateTask: true,
                  canCreateReception: true
                }
              };
            }
            return { ...u, ...user };
          }
          return u;
        })
      })),
      
      deleteUser: (id) => set((state) => ({
        users: state.users.filter(u => u.id !== id)
      })),
      
      getUser: (username, password) => {
        // In a real app, you would hash the password and compare with stored hash
        const user = get().users.find(u => 
          u.username === username && u.active
        );
        return user || null;
      }
    }),
    {
      name: 'user-storage'
    }
  )
);