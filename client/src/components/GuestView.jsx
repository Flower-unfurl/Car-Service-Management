import { useState, useEffect } from 'react';
import { CheckCircle2, Clock, AlertCircle, Car } from 'lucide-react';
import { mockServiceTasks, mockInspections, taskStatusLabels } from '../../mockOperationsData';

const GuestView = ({ booking }) => {
  const [tasks, setTasks] = useState([]);
  const [inspection, setInspection] = useState(null);

  useEffect(() => {
    const bookingTasks = mockServiceTasks[booking.id] || [];
    setTasks(bookingTasks);
    setInspection(mockInspections[booking.id] || null);
  }, [booking.id]);

  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const getEstimatedTimeRemaining = () => {
    const pendingTasks = tasks.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS');
    const totalMinutes = pendingTasks.reduce((sum, task) => sum + task.estimatedMinutes, 0);
    
    if (totalMinutes < 60) return `${totalMinutes} phút`;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours} giờ ${minutes} phút`;
  };

  return (
    <div className="space-y-6">
      {/* Hero Section với Progress */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Chào {booking.customerName}! 👋</h2>
            <p className="text-blue-100 text-lg">
              Xe của bạn đang được chăm sóc tận tình
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 text-center">
            <div className="text-4xl font-bold mb-1">{Math.round(progress)}%</div>
            <div className="text-sm text-blue-100">Hoàn thành</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="h-6 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
            <div 
              className="h-full bg-white rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-3"
              style={{ width: `${progress}%` }}
            >
              {progress > 10 && (
                <span className="text-blue-700 text-sm font-semibold">
                  {completedTasks}/{totalTasks}
                </span>
              )}
            </div>
          </div>
          <div className="flex justify-between mt-2 text-sm text-blue-100">
            <span>{completedTasks} bước hoàn thành</span>
            <span>Còn lại: {getEstimatedTimeRemaining()}</span>
          </div>
        </div>
      </div>

      {/* Vehicle Info Card */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Car className="w-8 h-8 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Thông tin xe
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Biển số</p>
                <p className="font-semibold text-gray-900">{booking.vehicleInfo.plate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Xe</p>
                <p className="font-semibold text-gray-900">
                  {booking.vehicleInfo.brand} {booking.vehicleInfo.model}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Năm sản xuất</p>
                <p className="font-semibold text-gray-900">{booking.vehicleInfo.year}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Thời gian check-in</p>
                <p className="font-semibold text-gray-900">
                  {new Date(booking.checkInTime).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Tasks Timeline */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          Tiến trình dịch vụ
        </h3>
        <div className="space-y-4">
          {tasks.map((task, index) => (
            <div key={task.id} className="flex items-start space-x-4">
              {/* Status Icon với đường kết nối */}
              <div className="relative flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all ${
                  task.status === 'COMPLETED' 
                    ? 'bg-green-500 text-white scale-110' 
                    : task.status === 'IN_PROGRESS'
                    ? 'bg-blue-500 text-white animate-pulse'
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {task.status === 'COMPLETED' ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : task.status === 'IN_PROGRESS' ? (
                    <Clock className="w-6 h-6" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-400" />
                  )}
                </div>
                {index < tasks.length - 1 && (
                  <div className={`w-0.5 h-16 mt-2 ${
                    task.status === 'COMPLETED' ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>

              {/* Task Info */}
              <div className={`flex-1 p-4 rounded-lg transition-all ${
                task.status === 'COMPLETED' 
                  ? 'bg-green-50 border border-green-200' 
                  : task.status === 'IN_PROGRESS'
                  ? 'bg-blue-50 border border-blue-200'
                  : 'bg-gray-50 border border-gray-200'
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {task.taskName}
                    </h4>
                    <p className="text-sm text-gray-600">{task.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-4 ${
                    task.status === 'COMPLETED' 
                      ? 'bg-green-100 text-green-700' 
                      : task.status === 'IN_PROGRESS'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {taskStatusLabels[task.status]}
                  </span>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  {task.assignedStaff && (
                    <span className="flex items-center">
                      <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs mr-2">
                        {task.assignedStaff.name.charAt(0)}
                      </span>
                      {task.assignedStaff.name}
                    </span>
                  )}
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {task.actualMinutes || task.estimatedMinutes} phút
                  </span>
                </div>

                {task.status === 'IN_PROGRESS' && (
                  <div className="mt-3">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '60%' }} />
                    </div>
                    <p className="text-xs text-blue-600 mt-1">Đang thực hiện...</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inspection Info (nếu có) */}
      {inspection && (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Thông tin đồng kiểm
          </h3>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2 text-green-700">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-semibold">Đã hoàn thành đồng kiểm</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Tình trạng xe đã được ghi nhận và xác nhận bởi cả hai bên
            </p>
          </div>
          
          {inspection.damages && inspection.damages.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Các vết hư hỏng đã ghi nhận:</h4>
              <div className="space-y-2">
                {inspection.damages.map(damage => (
                  <div key={damage.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{damage.location}</p>
                      <p className="text-sm text-gray-600">{damage.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Services Summary */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Dịch vụ đã đăng ký
        </h3>
        <div className="space-y-3">
          {booking.services.map(service => (
            <div key={service.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-900">{service.name}</span>
              <span className="text-blue-600 font-semibold">
                {service.price.toLocaleString('vi-VN')}đ
              </span>
            </div>
          ))}
          <div className="flex justify-between items-center pt-3 border-t-2 border-gray-200">
            <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
            <span className="text-xl font-bold text-blue-600">
              {booking.services.reduce((sum, s) => sum + s.price, 0).toLocaleString('vi-VN')}đ
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestView;
