import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Search, Trash2, Send, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useAuthStore } from '../../store/authStore';
import { useMessageStore } from '../../store/messageStore';
import { useUserStore } from '../../store/userStore';

const Messages = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { users } = useUserStore();
  const { messages, addMessage, markAsRead, deleteMessage, getUserMessages } = useMessageStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [newMessage, setNewMessage] = useState({
    to: '',
    subject: '',
    content: ''
  });

  if (!user) {
    return null;
  }

  const userMessages = getUserMessages(user.id);
  const filteredMessages = userMessages.filter(msg =>
    msg.subject.includes(searchQuery) ||
    msg.content.includes(searchQuery) ||
    users.find(u => u.id === (msg.from === user.id ? msg.to : msg.from))?.name.includes(searchQuery)
  );

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.to || !newMessage.subject || !newMessage.content) {
      toast.error('لطفاً تمام فیلدها را پر کنید');
      return;
    }

    try {
      addMessage({
        from: user.id,
        to: newMessage.to,
        subject: newMessage.subject,
        content: newMessage.content
      });
      
      toast.success('پیام با موفقیت ارسال شد');
      setShowNewMessage(false);
      setNewMessage({ to: '', subject: '', content: '' });
    } catch (error) {
      toast.error('خطا در ارسال پیام');
    }
  };

  const handleViewMessage = (message: any) => {
    if (!message.read && message.to === user.id) {
      markAsRead(message.id);
    }
    setSelectedMessage(message);
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      deleteMessage(id);
      toast.success('پیام با موفقیت حذف شد');
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
    } catch (error) {
      toast.error('خطا در حذف پیام');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">پیام‌ها</h1>
          <p className="text-gray-600 dark:text-gray-400">مدیریت پیام‌های داخلی</p>
        </div>
        
        <Button
          variant="primary"
          leftIcon={<Mail size={16} />}
          onClick={() => setShowNewMessage(true)}
        >
          پیام جدید
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
            placeholder="جستجو در پیام‌ها..."
          />
        </div>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <p className="text-gray-500 dark:text-gray-400">هیچ پیامی یافت نشد</p>
            </div>
          ) : (
            filteredMessages.map((message) => {
              const otherUser = users.find(u => 
                u.id === (message.from === user.id ? message.to : message.from)
              );
              
              return (
                <div
                  key={message.id}
                  onClick={() => handleViewMessage(message)}
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 cursor-pointer transition-colors ${
                    selectedMessage?.id === message.id ? 'ring-2 ring-accent' : ''
                  } ${!message.read && message.to === user.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-medium mb-1">{message.subject}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {message.from === user.id ? `به: ${otherUser?.name}` : `از: ${otherUser?.name}`}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        {message.createdAt}
                      </p>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMessage(message.id);
                      }}
                      className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <Card>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold mb-2">{selectedMessage.subject}</h2>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    {selectedMessage.from === user.id ? (
                      <p>به: {users.find(u => u.id === selectedMessage.to)?.name}</p>
                    ) : (
                      <p>از: {users.find(u => u.id === selectedMessage.from)?.name}</p>
                    )}
                    <p>تاریخ: {selectedMessage.createdAt}</p>
                  </div>
                </div>
                
                {selectedMessage.from !== user.id && (
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Send size={16} />}
                    onClick={() => {
                      setNewMessage({
                        to: selectedMessage.from,
                        subject: `پاسخ: ${selectedMessage.subject}`,
                        content: ''
                      });
                      setShowNewMessage(true);
                    }}
                  >
                    پاسخ
                  </Button>
                )}
              </div>
              
              <div className="border-t dark:border-gray-700 pt-4">
                <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
              </div>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
              یک پیام را برای نمایش انتخاب کنید
            </div>
          )}
        </div>
      </div>
      
      {showNewMessage && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowNewMessage(false)}></div>
            
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6">
              <button
                onClick={() => setShowNewMessage(false)}
                className="absolute top-4 left-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X size={20} />
              </button>
              
              <h2 className="text-xl font-bold mb-6">پیام جدید</h2>
              
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    گیرنده
                  </label>
                  <select
                    value={newMessage.to}
                    onChange={(e) => setNewMessage({ ...newMessage, to: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="">انتخاب کنید</option>
                    {users
                      .filter(u => u.id !== user.id)
                      .map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({getRoleName(u.role)})
                        </option>
                      ))
                    }
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    موضوع
                  </label>
                  <input
                    type="text"
                    value={newMessage.subject}
                    onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    متن پیام
                  </label>
                  <textarea
                    value={newMessage.content}
                    onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                    className="input"
                    rows={5}
                    required
                  ></textarea>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewMessage(false)}
                  >
                    انصراف
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    leftIcon={<Send size={16} />}
                  >
                    ارسال پیام
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

const getRoleName = (role: string): string => {
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

export default Messages;