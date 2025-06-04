import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Logo from '../../components/ui/Logo';
import Button from '../../components/ui/Button';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuthStore();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (!username || !password) {
        setError('لطفاً نام کاربری و رمز عبور را وارد کنید');
        return;
      }
      
      const result = await login(username, password);
      
      if (result.success) {
        toast.success('با موفقیت وارد شدید');
        navigate('/');
      } else {
        setError(result.message || 'خطا در ورود به سیستم');
        toast.error(result.message || 'خطا در ورود به سیستم');
      }
    } catch (err) {
      setError('خطا در برقراری ارتباط با سرور');
      toast.error('خطا در برقراری ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        <div className="p-6 sm:p-10 animate-slide-in">
          <div className="flex flex-col items-center justify-center mb-8">
            <Logo className="h-24 w-24 mb-4" showSlogan={true} />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-1">
              سیستم جامع سلطانی سنتر
            </h1>
          </div>
          
          {error && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-md">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                نام کاربری
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <User size={16} className="text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input pr-10 focus:ring-accent focus:border-accent"
                  placeholder="نام کاربری خود را وارد کنید"
                  dir="rtl"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                رمز عبور
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Lock size={16} className="text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-10 focus:ring-accent focus:border-accent"
                  placeholder="رمز عبور خود را وارد کنید"
                  dir="rtl"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 left-0 flex items-center pl-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={16} className="text-gray-400" />
                  ) : (
                    <Eye size={16} className="text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            
            <div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={loading}
                fullWidth
              >
                ورود به سیستم
              </Button>
            </div>

            <div className="text-sm text-center text-gray-500 dark:text-gray-400">
              راهنما: برای ورود به عنوان مدیر از نام کاربری <code className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-700">admin</code> و رمز عبور <code className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-700">admin123</code> استفاده کنید
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;