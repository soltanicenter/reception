import { useState, FormEvent } from 'react';
import { PlusCircle, Search, Edit, Trash2, X, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useCustomerStore } from '../../store/customerStore';
import { useAuthStore } from '../../store/authStore';

const CustomerManagement = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useCustomerStore();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: ''
  });
  
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    customer.phone.includes(searchQuery) ||
    customer.customerId.includes(searchQuery)
  );
  
  const handleEdit = (customer: any) => {
    if (user?.role !== 'admin') {
      toast.error('فقط مدیر سیستم می‌تواند اطلاعات مشتری را ویرایش کند');
      return;
    }
    
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      password: customer.password
    });
    setShowModal(true);
  };
  
  const handleDelete = async (customerId: string) => {
    if (user?.role !== 'admin') {
      toast.error('فقط مدیر سیستم می‌تواند مشتری را حذف کند');
      return;
    }
    
    setIsDeleting(customerId);
    try {
      await deleteCustomer(customerId);
      toast.success('مشتری با موفقیت حذف شد');
    } catch (error) {
      toast.error('خطا در حذف مشتری');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      toast.error('لطفاً نام و شماره تماس را وارد کنید');
      return;
    }

    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, {
          name: formData.name,
          phone: formData.phone,
          password: formData.password || formData.phone
        });
        toast.success('اطلاعات مشتری با موفقیت ویرایش شد');
      } else {
        await addCustomer({
          name: formData.name,
          phone: formData.phone
        });
        toast.success('مشتری جدید با موفقیت ثبت شد');
      }
      setShowModal(false);
      setEditingCustomer(null);
      setFormData({ name: '', phone: '', password: '' });
    } catch (error) {
      toast.error('خطا در ذخیره اطلاعات مشتری');
    }
  };
  
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">مدیریت مشتریان</h1>
          <p className="text-gray-600 dark:text-gray-400">مدیریت اطلاعات مشتریان سیستم</p>
        </div>
        
        {user?.role === 'admin' && (
          <Button
            variant="primary"
            leftIcon={<PlusCircle size={16} />}
            onClick={() => {
              setEditingCustomer(null);
              setFormData({ name: '', phone: '', password: '' });
              setShowModal(true);
            }}
          >
            مشتری جدید
          </Button>
        )}
      </div>
      
      <Card className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pr-10 w-full"
            placeholder="جستجوی مشتری..."
          />
        </div>
      </Card>
      
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                کد مشتری
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                نام و نام خانوادگی
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                شماره تماس
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                رمز ورود
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                تاریخ ثبت
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  مشتری‌ای یافت نشد
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {customer.customerId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{customer.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm ltr">
                    {customer.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm ltr">
                    {user?.role === 'admin' ? customer.password : '••••••'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {customer.createdAt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex items-center justify-end space-x-reverse space-x-2">
                      {user?.role === 'admin' && (
                        <>
                          <button
                            onClick={() => handleEdit(customer)}
                            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(customer.id)}
                            disabled={isDeleting === customer.id}
                            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 disabled:opacity-50"
                          >
                            {isDeleting === customer.id ? (
                              <span className="animate-spin">⚪</span>
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowModal(false)}></div>
            
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingCustomer(null);
                }}
                className="absolute top-4 left-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X size={20} />
              </button>
              
              <h2 className="text-xl font-bold mb-6">
                {editingCustomer ? 'ویرایش مشتری' : 'افزودن مشتری جدید'}
              </h2>
              
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    نام و نام خانوادگی
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    شماره تماس
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    رمز ورود
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="input pr-3 pl-10"
                      placeholder={editingCustomer ? '' : 'شماره تماس به عنوان رمز ورود'}
                    />
                    <button
                      type="button"
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowModal(false);
                      setEditingCustomer(null);
                    }}
                  >
                    انصراف
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                  >
                    {editingCustomer ? 'به‌روزرسانی' : 'ایجاد مشتری'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;