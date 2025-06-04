import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Customer {
  id: string;
  customerId: string;
  name: string;
  phone: string;
  password: string;
  createdAt: string;
}

interface CustomerStore {
  customers: Customer[];
  lastCustomerId: number;
  addCustomer: (customer: Omit<Customer, 'id' | 'customerId' | 'createdAt' | 'password'>) => Customer;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  getCustomerByPhone: (phone: string) => Customer | undefined;
}

export const useCustomerStore = create<CustomerStore>()(
  persist(
    (set, get) => ({
      customers: [],
      lastCustomerId: 7889, // Start from 7890
      
      addCustomer: (customer) => {
        const newCustomerId = get().lastCustomerId + 1;
        const newCustomer = {
          ...customer,
          id: Date.now().toString(),
          customerId: newCustomerId.toString(),
          password: customer.phone, // Use phone number as password
          createdAt: new Date().toLocaleDateString('fa-IR')
        };
        
        set((state) => ({
          customers: [newCustomer, ...state.customers],
          lastCustomerId: newCustomerId
        }));
        
        return newCustomer;
      },
      
      updateCustomer: (id, customer) => set((state) => ({
        customers: state.customers.map(c => 
          c.id === id ? { 
            ...c, 
            ...customer,
            // Update password if phone number changes
            password: customer.phone || c.password
          } : c
        )
      })),
      
      deleteCustomer: (id) => set((state) => ({
        customers: state.customers.filter(c => c.id !== id)
      })),
      
      getCustomerByPhone: (phone) => {
        return get().customers.find(c => c.phone === phone);
      }
    }),
    {
      name: 'customer-storage'
    }
  )
);