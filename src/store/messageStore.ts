import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  from: string;
  to: string;
  subject: string;
  content: string;
  createdAt: string;
  read: boolean;
}

interface MessageStore {
  messages: Message[];
  addMessage: (message: Omit<Message, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  deleteMessage: (id: string) => void;
  getUnreadCount: (userId: string) => number;
  getUserMessages: (userId: string) => Message[];
}

export const useMessageStore = create<MessageStore>()(
  persist(
    (set, get) => ({
      messages: [],
      
      addMessage: (message) => set((state) => ({
        messages: [{
          ...message,
          id: Date.now().toString(),
          createdAt: new Date().toLocaleDateString('fa-IR'),
          read: false
        }, ...state.messages]
      })),
      
      markAsRead: (id) => set((state) => ({
        messages: state.messages.map(msg =>
          msg.id === id ? { ...msg, read: true } : msg
        )
      })),
      
      deleteMessage: (id) => set((state) => ({
        messages: state.messages.filter(msg => msg.id !== id)
      })),
      
      getUnreadCount: (userId) => {
        return get().messages.filter(msg => 
          msg.to === userId && !msg.read
        ).length;
      },
      
      getUserMessages: (userId) => {
        return get().messages.filter(msg => 
          msg.to === userId || msg.from === userId
        ).sort((a, b) => b.id.localeCompare(a.id));
      }
    }),
    {
      name: 'message-storage'
    }
  )
);