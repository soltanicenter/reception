import { useState, useEffect, FormEvent } from 'react';
import { PlusCircle, Search, Edit, Trash2, Check, X, Key } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { UserRole } from '../../store/authStore';
import { useUserStore, UserPermissions } from '../../store/userStore';

interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  jobDescription: string;
  active: boolean;
  permissions: UserPermissions;
}

const defaultPermissions: UserPermissions = {
  canViewReceptions: false,
  canCreateTask: false,
  canCreateReception: false
};

const UserManagement = () => {
  const { users, addUser, updateUser, deleteUser } = useUserStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    role: 'technician' as UserRole,
    jobDescription: '',
    active: true,
    permissions: { ...defaultPermissions }
  });
  
  useEffect(() => {
    if (editingUser) {
      setFormData({
        username: editingUser.username,
        name: editingUser.name,
        role: editingUser.role,
        jobDescription: editingUser.jobDescription || '',
        active: editingUser.active,
        permissions: editingUser.permissions || { ...defaultPermissions }
      });

      // Set default permissions for receptionist role
      if (editingUser.role === 'receptionist') {
        setFormData(prev => ({
          ...prev,
          permissions: {
            canViewReceptions: true,
            canCreateTask: true,
            canCreateReception: true
          }
        }));
      }
    } else {
      setFormData({
        username: '',
        name: '',
        role: 'technician',
        jobDescription: '',
        active: true,
        permissions: { ...defaultPermissions }
      });
    }
  }, [editingUser]);
  
  const filteredUsers = users.filter(user => 
    (user.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (user.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    getRoleName(user.role).toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const getRoleName = (role: UserRole): string => {
    switch (role) {
      case 'admin':
        return 'مدیر';
      case 'receptionist':
        return 'پذیرش';
      case 'technician':
        return 'تکنسین';
      case 'warehouse':
        return 'انباردار';
      case 'detailing':
        return 'دیتیلینگ';
      case 'accountant':
        return 'حسابدار';
      default:
        return role;
    }
  };
  
  const getRoleBadgeColor = (role: UserRole): string => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'receptionist':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'technician':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'warehouse':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'detailing':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
      case 'accountant':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  
  const handleEdit = (user: User) => {
    const userWithPermissions = {
      ...user,
      permissions: user.permissions || { ...defaultPermissions }
    };
    setEditingUser(userWithPermissions);
    setShowModal(true);
  };
  
  const handleDelete = async (userId: string) => {
    setIsDeleting(userId);
    
    try {
      await deleteUser(userId);
      toast.success('کاربر با موفقیت حذف شد');
    } catch (error) {
      toast.error('خطا در حذف کاربر');
    } finally {
      setIsDeleting(null);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('رمز عبور و تکرار آن مطابقت ندارند');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('رمز عبور باید حداقل ۶ کاراکتر باشد');
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('رمز عبور با موفقیت تغییر یافت');
      setShowPasswordModal(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error('خطا در تغییر رمز عبور');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.name) {
      toast.error('لطفاً نام کاربری و نام را وارد کنید');
      return;
    }

    try {
      // Set default permissions for receptionist role
      const updatedFormData = {
        ...formData,
        permissions: formData.role === 'receptionist' ? {
          canViewReceptions: true,
          canCreateTask: true,
          canCreateReception: true
        } : formData.permissions
      };

      if (editingUser) {
        await updateUser(editingUser.id, updatedFormData);
        toast.success('کاربر با موفقیت ویرایش شد');
      } else {
        await addUser(updatedFormData);
        toast.success('کاربر جدید با موفقیت ایجاد شد');
      }
      setShowModal(false);
      setEditingUser(null);
    } catch (error) {
      toast.error('خطا در ذخیره اطلاعات کاربر');
    }
  };
  
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">مدیریت کاربران</h1>
          <p className="text-gray-600 dark:text-gray-400">مدیریت و دسترسی‌های کاربران سیستم</p>
        </div>
        
        <Button
          variant="primary"
          leftIcon={<PlusCircle size={16} />}
          onClick={() => {
            setEditingUser(null);
            setShowModal(true);
          }}
        >
          کاربر جدید
        </Button>
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
            placeholder="جستجوی کاربر..."
          />
        </div>
      </Card>
      
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                نام و نام خانوادگی
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                نام کاربری
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                نقش
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                وضعیت
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  کاربری یافت نشد
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{user.jobDescription}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {user.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${getRoleBadgeColor(user.role)}`}>
                      {getRoleName(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${user.active ? 
                      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                      {user.active ? 'فعال' : 'غیرفعال'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex items-center justify-end space-x-reverse space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUserId(user.id);
                          setShowPasswordModal(true);
                        }}
                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-yellow-600 dark:text-yellow-400"
                      >
                        <Key size={18} />
                      </button>
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={isDeleting === user.id}
                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 disabled:opacity-50"
                      >
                        {isDeleting === user.id ? (
                          <span className="animate-spin">⚪</span>
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
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
                  setEditingUser(null);
                }}
                className="absolute top-4 left-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X size={20} />
              </button>
              
              <h2 className="text-xl font-bold mb-6">
                {editingUser ? 'ویرایش کاربر' : 'افزودن کاربر جدید'}
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
                    نام کاربری
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    نقش کاربر
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => {
                      const newRole = e.target.value as UserRole;
                      setFormData({
                        ...formData,
                        role: newRole,
                        permissions: newRole === 'receptionist' ? {
                          canViewReceptions: true,
                          canCreateTask: true,
                          canCreateReception: true
                        } : { ...defaultPermissions }
                      });
                    }}
                    className="input"
                  >
                    <option value="admin">مدیر</option>
                    <option value="receptionist">پذیرش</option>
                    <option value="technician">تکنسین</option>
                    <option value="warehouse">انباردار</option>
                    <option value="detailing">دیتیلینگ</option>
                    <option value="accountant">حسابدار</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    شرح وظایف
                  </label>
                  <textarea
                    rows={3}
                    value={formData.jobDescription}
                    onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                    className="input"
                  ></textarea>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="active"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="h-4 w-4 text-accent focus:ring-accent"
                    />
                    <label htmlFor="active" className="mr-2 text-sm text-gray-700 dark:text-gray-300">
                      کاربر فعال است
                    </label>
                  </div>

                  {formData.role !== 'receptionist' && (
                    <>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="canViewReceptions"
                          checked={formData.permissions.canViewReceptions}
                          onChange={(e) => setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              canViewReceptions: e.target.checked
                            }
                          })}
                          className="h-4 w-4 text-accent focus:ring-accent"
                        />
                        <label htmlFor="canViewReceptions" className="mr-2 text-sm text-gray-700 dark:text-gray-300">
                          دسترسی به لیست پذیرش خودرو
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="canCreateTask"
                          checked={formData.permissions.canCreateTask}
                          onChange={(e) => setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              canCreateTask: e.target.checked
                            }
                          })}
                          className="h-4 w-4 text-accent focus:ring-accent"
                        />
                        <label htmlFor="canCreateTask" className="mr-2 text-sm text-gray-700 dark:text-gray-300">
                          ایجاد وظیفه در کارتابل
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="canCreateReception"
                          checked={formData.permissions.canCreateReception}
                          onChange={(e) => setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              canCreateReception: e.target.checked
                            }
                          })}
                          className="h-4 w-4 text-accent focus:ring-accent"
                        />
                        <label htmlFor="canCreateReception" className="mr-2 text-sm text-gray-700 dark:text-gray-300">
                          اجازه ثبت پذیرش خودرو
                        </label>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowModal(false);
                      setEditingUser(null);
                    }}
                  >
                    انصراف
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                  >
                    {editingUser ? 'به‌روزرسانی' : 'ایجاد کاربر'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowPasswordModal(false)}></div>
            
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-6">تغییر رمز عبور</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    رمز عبور جدید
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input"
                    placeholder="رمز عبور جدید"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    تکرار رمز عبور
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input"
                    placeholder="تکرار رمز عبور"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowPasswordModal(false)}
                >
                  انصراف
                </Button>
                <Button
                  variant="primary"
                  onClick={handlePasswordChange}
                >
                  تغییر رمز عبور
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;