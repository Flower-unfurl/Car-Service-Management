import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ClipboardCheck, 
  Users, 
  Package, 
  ArrowLeft,
  Clock,
  Car,
  Phone,
  Calendar
} from 'lucide-react';
import { mockBookings } from '../mockOperationsData';
import GuestView from '../components/GuestView';
import StaffView from '../components/StaffView';
import AdminView from '../components/AdminView';

const OperationsPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('ADMIN'); // Mock role, would come from auth
  const [booking, setBooking] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Fetch booking data
    const foundBooking = mockBookings.find(b => b.id === bookingId);
    if (foundBooking) {
      setBooking(foundBooking);
    }
  }, [bookingId]);

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/operations')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Vận hành dịch vụ #{booking.id}
                </h1>
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                  <span className="flex items-center">
                    <Car className="w-4 h-4 mr-1" />
                    {booking.vehicleInfo.plate} - {booking.vehicleInfo.brand} {booking.vehicleInfo.model}
                  </span>
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {booking.customerName}
                  </span>
                  <span className="flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    {booking.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center space-x-3">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                booking.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                booking.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {booking.status === 'COMPLETED' ? 'Hoàn thành' :
                 booking.status === 'IN_PROGRESS' ? 'Đang thực hiện' :
                 'Chờ xử lý'}
              </span>

              {/* Role Selector (for demo) */}
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="GUEST">Khách hàng</option>
                <option value="STAFF">Nhân viên</option>
                <option value="ADMIN">Quản lý</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {userRole === 'GUEST' && <GuestView booking={booking} />}
        {userRole === 'STAFF' && <StaffView booking={booking} />}
        {userRole === 'ADMIN' && <AdminView booking={booking} />}
      </div>
    </div>
  );
};

export default OperationsPage;
