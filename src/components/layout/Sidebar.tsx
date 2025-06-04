import { Link } from 'react-router-dom';
import { Home, Car, ClipboardList, Users, Settings, Mail, UserCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../contexts/ThemeContext';
import Logo from '../ui/Logo';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  
  const isAdmin = user?.role === 'admin';

  // Check user permissions
  const canViewReceptions = isAdmin || (user?.permissions?.canViewReceptions ?? false);
  const canCreateTask = isAdmin || (user?.permissions?.canCreateTask ?? false);
  const canCreateReception = isAdmin || (user?.permissions?.canCreateReception ?? false);

  const navigation = [
    { 
      name: 'داشبورد',
      href: '/',
      icon: Home,
      current: location.pathname === '/',
      show: true
    },
    { 
      name: 'پذیرش خودرو',
      href: '/reception',
      icon: Car,
      current: location.pathname === '/reception',
      show: canCreateReception
    },
    { 
      name: 'لیست پذیرش‌ها',
      href: '/reception/list',
      icon: ClipboardList,
      current: location.pathname === '/reception/list',
      show: canViewReceptions
    },
    { 
      name: 'کارتابل وظایف',
      href: '/tasks',
      icon: ClipboardList,
      current: location.pathname === '/tasks',
      show: canCreateTask
    },
    { 
      name: 'مدیریت کاربران',
      href: '/users',
      icon: Users,
      current: location.pathname === '/users',
      show: isAdmin
    },
    {
      name: 'مدیریت مشتریان',
      href: '/customers',
      icon: UserCircle,
      current: location.pathname === '/customers',
      show: true
    },
    {
      name: 'پیام‌ها',
      href: '/messages',
      icon: Mail,
      current: location.pathname === '/messages',
      show: true
    },
    {
      name: 'تنظیمات',
      href: '/settings',
      icon: Settings,
      current: location.pathname === '/settings',
      show: true
    }
  ];

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setOpen(false)}
      />

      <aside
        className={`fixed top-0 right-0 h-full bg-white dark:bg-gray-800 shadow-lg z-30 transition-all duration-300 ${
          open ? 'translate-x-0 w-64' : 'w-16 translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Logo className={open ? "h-8 w-8" : "h-10 w-10"} />
            {open && <h2 className="font-bold text-lg">سلطانی سنتر</h2>}
          </div>
        </div>

        <nav className="p-4 flex flex-col justify-between h-[calc(100%-80px)]">
          <ul className="space-y-2">
            {navigation.map((item) => 
              item.show && (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                      item.current 
                        ? 'bg-accent text-white' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    title={!open ? item.name : undefined}
                  >
                    <item.icon className={open ? "h-5 w-5" : "h-8 w-8"} />
                    {open && <span className="mr-3">{item.name}</span>}
                  </Link>
                </li>
              )
            )}
          </ul>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <button
              onClick={toggleTheme}
              className="flex items-center w-full px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              title={!open ? (theme === 'light' ? 'حالت تاریک' : 'حالت روشن') : undefined}
            >
              <Settings className={open ? "h-5 w-5" : "h-8 w-8"} />
              {open && (
                <span className="mr-3">
                  {theme === 'light' ? 'حالت تاریک' : 'حالت روشن'}
                </span>
              )}
            </button>
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
              {open && <span>نسخه ۱.۰.۰ &copy; ۱۴۰۴</span>}
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}