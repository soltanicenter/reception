import { useState } from 'react';
import { Search, Edit, Eye, Printer, Trash2, Check, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useReceptionStore } from '../../store/receptionStore';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import moment from 'moment-jalaali';

const VehicleList = () => {
  const navigate = useNavigate();
  const { receptions, deleteReception } = useReceptionStore();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedReception, setSelectedReception] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Check if user has permission to delete receptions
  const canDeleteReceptions = user?.role === 'admin';

  const filteredVehicles = receptions.filter(reception => {
    const matchesSearch = 
      reception.customerInfo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reception.customerInfo.phone.includes(searchQuery) ||
      reception.vehicleInfo.plateNumber.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || reception.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (reception: any) => {
    setSelectedReception(reception);
    setShowDetailsModal(true);
  };

  const handleEdit = (id: string) => {
    navigate(`/reception/edit/${id}`);
  };

  const handlePrint = async (reception: any) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      doc.setR2L(true);

      // Add header
      doc.setFontSize(20);
      doc.text('فرم پذیرش خودرو - سلطانی سنتر', doc.internal.pageSize.width / 2, 20, { align: 'center' });

      // Customer Information
      doc.setFontSize(16);
      doc.text('اطلاعات مشتری', 20, 50);
      
      doc.setFontSize(12);
      const customerInfo = [
        ['نام و نام خانوادگی:', reception.customerInfo.name],
        ['شماره تماس:', reception.customerInfo.phone],
        ['کد ملی:', reception.customerInfo.nationalId],
        ['آدرس:', reception.customerInfo.address],
      ];

      (doc as any).autoTable({
        startY: 55,
        body: customerInfo,
        theme: 'plain',
        styles: {
          fontSize: 12,
          halign: 'right',
        },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 'auto' },
        },
      });

      // Vehicle Information
      const lastY = (doc as any).lastAutoTable?.finalY || 55;
      doc.setFontSize(16);
      doc.text('اطلاعات خودرو', 20, lastY + 20);
      
      doc.setFontSize(12);
      const vehicleInfo = [
        ['سازنده:', reception.vehicleInfo.make],
        ['مدل:', reception.vehicleInfo.model],
        ['سال تولید:', reception.vehicleInfo.year],
        ['رنگ:', reception.vehicleInfo.color],
        ['شماره پلاک:', reception.vehicleInfo.plateNumber],
        ['شماره VIN:', reception.vehicleInfo.vin],
        ['کیلومتر کارکرد:', reception.vehicleInfo.mileage],
      ];

      (doc as any).autoTable({
        startY: lastY + 25,
        body: vehicleInfo,
        theme: 'plain',
        styles: {
          fontSize: 12,
          halign: 'right',
        },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 'auto' },
        },
      });

      // Service Information
      const lastY2 = (doc as any).lastAutoTable?.finalY || (lastY + 25);
      doc.setFontSize(16);
      doc.text('اطلاعات سرویس', 20, lastY2 + 20);
      
      doc.setFontSize(12);
      const serviceInfo = [
        ['شرح خدمات:', reception.serviceInfo.description],
        ['تاریخ تکمیل:', reception.serviceInfo.estimatedCompletion],
      ];

      (doc as any).autoTable({
        startY: lastY2 + 25,
        body: serviceInfo,
        theme: 'plain',
        styles: {
          fontSize: 12,
          halign: 'right',
        },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 'auto' },
        },
      });

      // Customer Requests
      const lastY3 = (doc as any).lastAutoTable?.finalY || (lastY2 + 25);
      doc.setFontSize(14);
      doc.text('درخواست مشتری:', 20, lastY3 + 20);
      
      const requests = (reception.serviceInfo.customerRequests || []).map((request: string, index: number) => 
        [`${index + 1}.`, request]
      );

      if (requests.length > 0) {
        (doc as any).autoTable({
          startY: lastY3 + 25,
          body: requests,
          theme: 'plain',
          styles: {
            fontSize: 12,
            halign: 'right',
          },
          columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 'auto' },
          },
        });
      }

      // Add images if available
      if (reception.images?.length > 0) {
        doc.addPage();
        doc.setFontSize(16);
        doc.text('تصاویر خودرو', 20, 20);

        let y = 30;
        reception.images.forEach((image: string, index: number) => {
          if (y > 250) {
            doc.addPage();
            y = 30;
          }
          doc.addImage(image, 'JPEG', 20, y, 170, 100);
          y += 110;
        });
      }

      // Save the PDF
      doc.save(`پذیرش-${reception.customerInfo.name}-${moment().format('jYYYY-jMM-jDD')}.pdf`);
      toast.success('فایل PDF با موفقیت ایجاد شد');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('خطا در ایجاد فایل PDF');
    }
  };

  const handleDelete = async (id: string) => {
    if (!canDeleteReceptions) {
      toast.error('شما دسترسی حذف پذیرش را ندارید');
      return;
    }

    setIsDeleting(id);
    try {
      await deleteReception(id);
      toast.success('پذیرش با موفقیت حذف شد');
    } catch (error) {
      toast.error('خطا در حذف پذیرش');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">لیست پذیرش خودرو</h1>
          <p className="text-gray-600 dark:text-gray-400">مدیریت و پیگیری خودروهای پذیرش شده</p>
        </div>
      </div>

      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pr-10"
              placeholder="جستجو در پذیرش‌ها..."
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input min-w-[180px]"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="pending">در انتظار</option>
            <option value="in-progress">در حال تعمیر</option>
            <option value="completed">تکمیل شده</option>
          </select>
        </div>
      </Card>

      <div className="space-y-4">
        {filteredVehicles.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <p className="text-gray-500 dark:text-gray-400">هیچ پذیرشی یافت نشد</p>
          </div>
        ) : (
          filteredVehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <div className="flex items-center gap-4 mb-3">
                    <h3 className="font-bold text-lg">
                      {vehicle.vehicleInfo.make} {vehicle.vehicleInfo.model}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      vehicle.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                      vehicle.status === 'in-progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    }`}>
                      {vehicle.status === 'pending' ? 'در انتظار' :
                       vehicle.status === 'in-progress' ? 'در حال تعمیر' :
                       'تکمیل شده'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">مشتری:</p>
                      <p>{vehicle.customerInfo.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">شماره تماس:</p>
                      <p className="ltr">{vehicle.customerInfo.phone}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">پلاک:</p>
                      <p className="ltr">{vehicle.vehicleInfo.plateNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">تاریخ پذیرش:</p>
                      <p>{vehicle.createdAt}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Eye size={16} />}
                    onClick={() => handleViewDetails(vehicle)}
                  >
                    مشاهده
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Edit size={16} />}
                    onClick={() => handleEdit(vehicle.id)}
                  >
                    ویرایش
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Printer size={16} />}
                    onClick={() => handlePrint(vehicle)}
                  >
                    چاپ
                  </Button>
                  {canDeleteReceptions && (
                    <Button
                      variant="danger"
                      size="sm"
                      leftIcon={<Trash2 size={16} />}
                      isLoading={isDeleting === vehicle.id}
                      onClick={() => handleDelete(vehicle.id)}
                    >
                      حذف
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showDetailsModal && selectedReception && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowDetailsModal(false)}></div>
            
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full p-6">
              <h2 className="text-xl font-bold mb-6">جزئیات پذیرش</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">اطلاعات مشتری</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">نام:</p>
                      <p>{selectedReception.customerInfo.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">تلفن:</p>
                      <p className="ltr">{selectedReception.customerInfo.phone}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-600 dark:text-gray-400">آدرس:</p>
                      <p>{selectedReception.customerInfo.address}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">اطلاعات خودرو</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">مدل:</p>
                      <p>{selectedReception.vehicleInfo.make} {selectedReception.vehicleInfo.model}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">سال:</p>
                      <p>{selectedReception.vehicleInfo.year}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">رنگ:</p>
                      <p>{selectedReception.vehicleInfo.color}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">پلاک:</p>
                      <p className="ltr">{selectedReception.vehicleInfo.plateNumber}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">شرح خدمات</h3>
                  <p>{selectedReception.serviceInfo.description}</p>
                  
                  <h4 className="font-semibold mt-4 mb-2">درخواست مشتری:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {(selectedReception.serviceInfo.customerRequests || []).map((request: string, index: number) => (
                      <li key={index}>{request}</li>
                    ))}
                  </ul>
                </div>

                {selectedReception.images?.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">تصاویر خودرو</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedReception.images.map((image: string, index: number) => (
                        <div key={index} className="relative aspect-video">
                          <img
                            src={image}
                            alt={`تصویر ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end mt-6">
                <Button
                  variant="primary"
                  onClick={() => setShowDetailsModal(false)}
                >
                  بستن
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleList;