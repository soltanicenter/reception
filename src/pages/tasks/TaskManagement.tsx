import { useState, useEffect } from 'react';
import { ClipboardList, Plus, Eye, Edit, Trash2, Check, History } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useAuthStore } from '../../store/authStore';
import { useTaskStore } from '../../store/taskStore';
import { useReceptionStore } from '../../store/receptionStore';
import { useUserStore } from '../../store/userStore';
import { toast } from 'react-hot-toast';

const TaskManagement = () => {
  const { user } = useAuthStore();
  const { tasks, addTask, updateTask, deleteTask } = useTaskStore();
  const { receptions } = useReceptionStore();
  const { users } = useUserStore();
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [viewMode, setViewMode] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [formData, setFormData] = useState({
    vehicleId: '',
    title: '',
    description: '',
    assignedTo: '',
    status: 'pending'
  });

  // Filter tasks based on user role
  const filteredTasks = tasks.filter(task => {
    if (user?.role === 'admin' || user?.role === 'receptionist') {
      return true;
    }
    return task.assignedTo.id === user?.id;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.vehicleId || !formData.title || !formData.assignedTo) {
      toast.error('لطفاً تمام فیلدهای ضروری را پر کنید');
      return;
    }

    const vehicle = receptions.find(r => r.id === formData.vehicleId);
    const assignedUser = users.find(u => u.id === formData.assignedTo);

    if (!vehicle || !assignedUser) {
      toast.error('اطلاعات نامعتبر');
      return;
    }

    try {
      if (editingTask) {
        updateTask(
          editingTask.id,
          {
            ...formData,
            vehicle: {
              id: vehicle.id,
              make: vehicle.vehicleInfo.make,
              model: vehicle.vehicleInfo.model,
              plateNumber: vehicle.vehicleInfo.plateNumber
            },
            assignedTo: {
              id: assignedUser.id,
              name: assignedUser.name
            }
          },
          user?.name || 'کاربر نامشخص'
        );
        toast.success('وظیفه با موفقیت ویرایش شد');
      } else {
        addTask({
          ...formData,
          vehicle: {
            id: vehicle.id,
            make: vehicle.vehicleInfo.make,
            model: vehicle.vehicleInfo.model,
            plateNumber: vehicle.vehicleInfo.plateNumber
          },
          assignedTo: {
            id: assignedUser.id,
            name: assignedUser.name
          },
          priority: 'medium',
          dueDate: new Date().toLocaleDateString('fa-IR')
        });
        toast.success('وظیفه جدید با موفقیت ایجاد شد');
      }
      
      setShowModal(false);
      setEditingTask(null);
      setViewMode(false);
      setFormData({
        vehicleId: '',
        title: '',
        description: '',
        assignedTo: '',
        status: 'pending'
      });
    } catch (error) {
      toast.error('خطا در ثبت وظیفه');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id);
      toast.success('وظیفه با موفقیت حذف شد');
    } catch (error) {
      toast.error('خطا در حذف وظیفه');
    }
  };

  const handleStatusChange = (taskId: string, newStatus: 'pending' | 'in-progress' | 'completed') => {
    try {
      updateTask(
        taskId,
        { status: newStatus },
        user?.name || 'کاربر نامشخص'
      );
      toast.success('وضعیت وظیفه با موفقیت تغییر کرد');
    } catch (error) {
      toast.error('خطا در تغییر وضعیت وظیفه');
    }
  };

  const canCreateTask = user?.role === 'admin' || 
                       user?.role === 'receptionist' || 
                       user?.permissions?.canCreateTask;

  const canEditTask = (task: any) => {
    return user?.role === 'admin' || 
           task.assignedTo.id === user?.id || 
           user?.role === 'receptionist';
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">کارتابل وظایف</h1>
          <p className="text-gray-600 dark:text-gray-400">مدیریت و پیگیری وظایف</p>
        </div>
        
        {canCreateTask && (
          <Button
            variant="primary"
            leftIcon={<Plus size={16} />}
            onClick={() => {
              setEditingTask(null);
              setViewMode(false);
              setFormData({
                vehicleId: '',
                title: '',
                description: '',
                assignedTo: '',
                status: 'pending'
              });
              setShowModal(true);
            }}
          >
            ایجاد وظیفه جدید
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredTasks.length === 0 ? (
          <Card>
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              هیچ وظیفه‌ای یافت نشد
            </div>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <Card key={task.id}>
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg">{task.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      task.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                      task.status === 'in-progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    }`}>
                      {task.status === 'pending' ? 'شروع نشده' :
                       task.status === 'in-progress' ? 'در حال انجام' :
                       'انجام شده'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">خودرو:</p>
                      <p>{task.vehicle.make} {task.vehicle.model} - {task.vehicle.plateNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">مسئول انجام:</p>
                      <p>{task.assignedTo.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">تاریخ ایجاد:</p>
                      <p>{task.createdAt}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">آخرین به‌روزرسانی:</p>
                      <p>{task.updatedAt}</p>
                    </div>
                  </div>

                  {task.description && (
                    <div className="mt-4">
                      <p className="text-gray-600 dark:text-gray-400">گزارش کار:</p>
                      <p className="whitespace-pre-wrap">{task.description}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-row md:flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Eye size={16} />}
                    onClick={() => {
                      setEditingTask(task);
                      setViewMode(true);
                      setFormData({
                        vehicleId: task.vehicle.id,
                        title: task.title,
                        description: task.description,
                        assignedTo: task.assignedTo.id,
                        status: task.status
                      });
                      setShowModal(true);
                    }}
                  >
                    مشاهده
                  </Button>
                  
                  {canEditTask(task) && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Edit size={16} />}
                        onClick={() => {
                          setEditingTask(task);
                          setViewMode(false);
                          setFormData({
                            vehicleId: task.vehicle.id,
                            title: task.title,
                            description: task.description,
                            assignedTo: task.assignedTo.id,
                            status: task.status
                          });
                          setShowModal(true);
                        }}
                      >
                        ویرایش
                      </Button>

                      {task.status !== 'completed' && (
                        <Button
                          variant="success"
                          size="sm"
                          leftIcon={<Check size={16} />}
                          onClick={() => handleStatusChange(task.id, 'completed')}
                        >
                          تکمیل
                        </Button>
                      )}

                      {user?.role === 'admin' && (
                        <Button
                          variant="danger"
                          size="sm"
                          leftIcon={<Trash2 size={16} />}
                          onClick={() => handleDelete(task.id)}
                        >
                          حذف
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowModal(false)}></div>
            
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  {viewMode ? 'مشاهده وظیفه' : editingTask ? 'ویرایش وظیفه' : 'ایجاد وظیفه جدید'}
                </h2>
                {editingTask && (
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<History size={16} />}
                    onClick={() => setShowHistory(!showHistory)}
                  >
                    تاریخچه تغییرات
                  </Button>
                )}
              </div>
              
              {showHistory && editingTask?.history && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <h3 className="font-semibold mb-3">تاریخچه تغییرات:</h3>
                  <div className="space-y-2">
                    {editingTask.history.map((entry: any, index: number) => (
                      <div key={index} className="text-sm">
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                          <span>{entry.date}</span>
                          <span>توسط: {entry.updatedBy}</span>
                        </div>
                        <p>{entry.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    خودرو
                  </label>
                  <select
                    value={formData.vehicleId}
                    onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                    className="input"
                    required
                    disabled={viewMode || !canCreateTask}
                  >
                    <option value="">انتخاب کنید</option>
                    {receptions.map(reception => (
                      <option key={reception.id} value={reception.id}>
                        {reception.vehicleInfo.make} {reception.vehicleInfo.model} - {reception.vehicleInfo.plateNumber}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    عنوان وظیفه
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input"
                    required
                    disabled={viewMode || !canCreateTask}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    مسئول انجام
                  </label>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="input"
                    required
                    disabled={viewMode || !canCreateTask}
                  >
                    <option value="">انتخاب کنید</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role === 'admin' ? 'مدیر' :
                                 u.role === 'technician' ? 'تکنسین' :
                                 u.role === 'receptionist' ? 'پذیرش' :
                                 u.role === 'warehouse' ? 'انباردار' :
                                 u.role === 'detailing' ? 'دیتیلینگ' :
                                 u.role === 'accountant' ? 'حسابدار' : u.role})
                      </option>
                    ))}
                  </select>
                </div>

                {(canCreateTask || formData.assignedTo === user?.id) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      وضعیت
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="input"
                      disabled={viewMode && !canEditTask(editingTask)}
                    >
                      <option value="pending">شروع نشده</option>
                      <option value="in-progress">در حال انجام</option>
                      <option value="completed">انجام شده</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    گزارش کار
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input"
                    rows={4}
                    disabled={viewMode && !canEditTask(editingTask)}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowModal(false);
                      setEditingTask(null);
                      setViewMode(false);
                    }}
                  >
                    بستن
                  </Button>
                  {(!viewMode || canEditTask(editingTask)) && (
                    <Button
                      type="submit"
                      variant="primary"
                    >
                      {editingTask ? 'به‌روزرسانی' : 'ایجاد وظیفه'}
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagement;