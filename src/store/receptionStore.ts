import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Reception {
  id: string;
  customerInfo: {
    name: string;
    phone: string;
    nationalId: string;
    address: string;
  };
  vehicleInfo: {
    make: string;
    model: string;
    year: string;
    color: string;
    plateNumber: string;
    vin: string;
    mileage: string;
  };
  serviceInfo: {
    description: string;
    estimatedCompletion?: string;
    customerComplaints: string[];
    customerRequests?: string[];
    signature?: string | null;
  };
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
  images?: string[];
  documents?: string[];
}

interface ReceptionStore {
  receptions: Reception[];
  addReception: (reception: Omit<Reception, 'id' | 'status' | 'createdAt'>) => void;
  updateReception: (id: string, reception: Partial<Reception>) => void;
  deleteReception: (id: string) => void;
}

export const useReceptionStore = create<ReceptionStore>()(
  persist(
    (set) => ({
      receptions: [],
      addReception: (reception) => set((state) => ({
        receptions: [{
          ...reception,
          id: Date.now().toString(),
          status: 'pending',
          createdAt: new Date().toLocaleDateString('fa-IR')
        }, ...state.receptions]
      })),
      updateReception: (id, reception) => set((state) => ({
        receptions: state.receptions.map(r => 
          r.id === id ? { ...r, ...reception } : r
        )
      })),
      deleteReception: (id) => set((state) => ({
        receptions: state.receptions.filter(r => r.id !== id)
      }))
    }),
    {
      name: 'reception-storage'
    }
  )
);