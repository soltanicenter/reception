import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';

import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import VehicleReception from './pages/reception/VehicleReception';
import VehicleList from './pages/reception/VehicleList';
import TaskManagement from './pages/tasks/TaskManagement';
import UserManagement from './pages/users/UserManagement';
import CustomerManagement from './pages/customers/CustomerManagement';
import Messages from './pages/messages/Messages';
import Settings from './pages/settings/Settings';
import NotFound from './pages/NotFound';
import { useAuthStore } from './store/authStore';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  const { isAuthenticated, user, updateUserSettings } = useAuthStore();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }

    // Load sidebar state from user settings
    if (user?.settings?.sidebarOpen !== undefined) {
      setSidebarOpen(user.settings.sidebarOpen);
    }
  }, [user]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleSidebarToggle = (open: boolean) => {
    setSidebarOpen(open);
    updateUserSettings({ sidebarOpen: open });
  };

  return (
    <ThemeProvider value={{ theme, toggleTheme }}>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
        <button 
          onClick={toggleTheme} 
          className="fixed left-4 bottom-4 z-50 p-2 rounded-full bg-primary text-white shadow-lg"
          aria-label="تغییر تم"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        
        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
          
          <Route 
            path="/" 
            element={
              isAuthenticated ? (
                <Layout sidebarOpen={sidebarOpen} setSidebarOpen={handleSidebarToggle} />
              ) : (
                <Navigate to="/login" />
              )
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="reception" element={<VehicleReception />} />
            <Route path="reception/edit/:id" element={<VehicleReception />} />
            <Route path="reception/list" element={<VehicleList />} />
            <Route path="tasks" element={<TaskManagement />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="customers" element={<CustomerManagement />} />
            <Route path="messages" element={<Messages />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;