import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignedTo: {
    id: string;
    name: string;
  };
  vehicle: {
    id: string;
    make: string;
    model: string;
    plateNumber: string;
  };
  createdAt: string;
  updatedAt: string;
  dueDate: string;
  history?: {
    date: string;
    status: string;
    description: string;
    updatedBy: string;
  }[];
}

interface TaskStore {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'history'>) => void;
  updateTask: (id: string, task: Partial<Task>, updatedBy: string) => void;
  deleteTask: (id: string) => void;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      tasks: [],
      addTask: (task) => set((state) => ({
        tasks: [{
          ...task,
          id: Date.now().toString(),
          status: 'pending',
          createdAt: new Date().toLocaleDateString('fa-IR'),
          updatedAt: new Date().toLocaleDateString('fa-IR'),
          history: [{
            date: new Date().toLocaleDateString('fa-IR'),
            status: 'pending',
            description: 'وظیفه ایجاد شد',
            updatedBy: task.assignedTo.name
          }]
        }, ...state.tasks]
      })),
      updateTask: (id, task, updatedBy) => set((state) => ({
        tasks: state.tasks.map(t => {
          if (t.id === id) {
            const now = new Date().toLocaleDateString('fa-IR');
            const history = [...(t.history || [])];
            
            // Add history entry if status changed
            if (task.status && task.status !== t.status) {
              history.push({
                date: now,
                status: task.status,
                description: `وضعیت به ${
                  task.status === 'pending' ? 'در انتظار' :
                  task.status === 'in-progress' ? 'در حال انجام' :
                  'تکمیل شده'
                } تغییر کرد`,
                updatedBy
              });
            }
            
            // Add history entry if description updated
            if (task.description && task.description !== t.description) {
              history.push({
                date: now,
                status: t.status,
                description: 'گزارش کار به‌روزرسانی شد',
                updatedBy
              });
            }
            
            return {
              ...t,
              ...task,
              updatedAt: now,
              history
            };
          }
          return t;
        })
      })),
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter(t => t.id !== id)
      }))
    }),
    {
      name: 'task-storage'
    }
  )
);