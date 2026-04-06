import { useState, useEffect } from 'react';
import { 
  Users, 
  Package, 
  ClipboardCheck, 
  UserPlus, 
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Camera,
  FileText
} from 'lucide-react';
import { 
  mockServiceTasks, 
  mockStaff, 
  mockMaterials, 
  mockInspections,
  mockMaterialUsage,
  specialtyLabels,
  taskStatusLabels 
} from '../../mockOperationsData';

const AdminView = ({ booking }) => {
  const [tasks, setTasks] = useState([]);
  const [staff, setStaff] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [inspection, setInspection] = useState(null);
  const [materialUsage, setMaterialUsage] = useState([]);
  const [selectedTab, setSelectedTab] = useState('tasks');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [taskToAssign, setTaskToAssign] = useState(null);

  useEffect(() => {
    setTasks(mockServiceTasks[booking.id] || []);
    setStaff(mockStaff);
    setMaterials(mockMaterials);
    setInspection(mockInspections[booking.id]);
    setMaterialUsage(mockMaterialUsage[booking.id] || []);
  }, [booking.id]);

  const getTaskProgress = () => {
    const completed = tasks.filter(t => t.status === 'COMPLETED').length;
    return { completed, total: tasks.length, percentage: (completed / tasks.length) * 100 };
  };

  const getStaffBySpecialty = (specialty) => {
    return staff.filter(s => s.specialty === specialty && s.status === 'AVAILABLE');
  };

  const handleAssignStaff = (task) => {
    setTaskToAssign(task);
    setShowAssignModal(true);
  };

  const assignStaffToTask = (staffMember) => {
    setTasks(prevTasks =>
      prevTasks.map(t =>
        t.id === taskToAssign.id
          ? { ...t, assignedStaff: staffMember }
          : t
      )
    );
    setStaff(prevStaff =>
      prevStaff.map(s =>
        s.id === staffMember.id
          ? { ...s, status: 'BUSY', currentTask: taskToAssign.id }
          : s
      )
    );
    setShowAssignModal(false);
    setTaskToAssign(null);
  };

  const progress = getTaskProgress();

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tiến độ</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(progress.percentage)}%
              </p>
              <p className="text-xs text-gray-500">
                {progress.completed}/{progress.total} công việc
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Nhân viên</p>
              <p className="text-2xl font-bold text-gray-900">
                {staff.filter(s => s.status === 'BUSY').length}/{staff.length}
              </p>
              <p className="text-xs text-gray-500">Đang làm việc</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Vật tư</p>
              <p className="text-2xl font-bold text-gray-900">
                {materials.filter(m => m.currentStock < m.minStock).length}
              </p>
              <p className="text-xs text-gray-500">Cần nhập thêm</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <Package className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đồng kiểm</p>
              <p className="text-2xl font-bold text-gray-900">
                {inspection ? '✓' : '⏳'}
              </p>
              <p className="text-xs text-gray-500">
                {inspection ? 'Đã hoàn thành' : 'Chưa thực hiện'}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${inspection ? 'bg-green-100' : 'bg-gray-100'}`}>
              <ClipboardCheck className={`w-6 h-6 ${inspection ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100">
        <div className="border-b border-gray-200">
          <div className="flex space-x-1 p-2">
            {[
              { id: 'tasks', label: 'Công việc', icon: ClipboardCheck },
              { id: 'staff', label: 'Nhân viên', icon: Users },
              { id: 'materials', label: 'Vật tư', icon: Package },
              { id: 'inspection', label: 'Đồng kiểm', icon: Camera }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Tasks Tab */}
          {selectedTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Quản lý công việc
                </h3>
              </div>

              {tasks.map(task => (
                <div
                  key={task.id}
                  className={`p-4 rounded-lg border-2 ${
                    task.status === 'COMPLETED'
                      ? 'bg-green-50 border-green-200'
                      : task.status === 'IN_PROGRESS'
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          task.status === 'COMPLETED'
                            ? 'bg-green-500 text-white'
                            : task.status === 'IN_PROGRESS'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-300 text-gray-700'
                        }`}>
                          Bước {task.stepOrder}
                        </span>
                        <h4 className="font-semibold text-gray-900">{task.taskName}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          task.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-700'
                            : task.status === 'IN_PROGRESS'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {taskStatusLabels[task.status]}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">{task.description}</p>

                      <div className="flex items-center space-x-6 text-sm">
                        <span className="flex items-center text-gray-600">
                          <Clock className="w-4 h-4 mr-1" />
                          {task.estimatedMinutes} phút
                        </span>
                        
                        {task.assignedStaff ? (
                          <span className="flex items-center text-gray-600">
                            <Users className="w-4 h-4 mr-1" />
                            {task.assignedStaff.name}
                            <span className="ml-2 text-xs text-gray-500">
                              ({specialtyLabels[task.assignedStaff.specialty]})
                            </span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleAssignStaff(task)}
                            className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
                          >
                            <UserPlus className="w-4 h-4 mr-1" />
                            Giao việc
                          </button>
                        )}

                        {task.materials && task.materials.length > 0 && (
                          <span className="flex items-center text-gray-600">
                            <Package className="w-4 h-4 mr-1" />
                            {task.materials.length} vật tư
                          </span>
                        )}
                      </div>

                      {task.materials && task.materials.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {task.materials.map(material => (
                            <span
                              key={material.id}
                              className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs"
                            >
                              {material.name}: {material.quantity} {material.unit}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {task.status === 'COMPLETED' && (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Staff Tab */}
          {selectedTab === 'staff' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Danh sách nhân viên
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {staff.map(staffMember => (
                  <div
                    key={staffMember.id}
                    className={`p-4 rounded-lg border-2 ${
                      staffMember.status === 'AVAILABLE'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                          staffMember.status === 'AVAILABLE' ? 'bg-green-500' : 'bg-gray-400'
                        }`}>
                          {staffMember.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{staffMember.name}</h4>
                          <p className="text-sm text-gray-600">
                            {specialtyLabels[staffMember.specialty]}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Kinh nghiệm: {staffMember.experience} năm
                          </p>
                          <p className="text-xs text-gray-500">
                            {staffMember.phone}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        staffMember.status === 'AVAILABLE'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {staffMember.status === 'AVAILABLE' ? 'Rảnh' : 'Đang bận'}
                      </span>
                    </div>

                    {staffMember.currentTask && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500">Đang làm:</p>
                        <p className="text-sm font-medium text-gray-900">
                          {tasks.find(t => t.id === staffMember.currentTask)?.taskName}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Materials Tab */}
          {selectedTab === 'materials' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Quản lý vật tư
                </h3>
                {materialUsage.length > 0 && (
                  <span className="text-sm text-gray-600">
                    Đã sử dụng: {materialUsage.length} lần
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {materials.map(material => {
                  const isLowStock = material.currentStock < material.minStock;
                  
                  return (
                    <div
                      key={material.id}
                      className={`p-4 rounded-lg border ${
                        isLowStock
                          ? 'bg-red-50 border-red-200'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{material.name}</h4>
                            {isLowStock && (
                              <AlertCircle className="w-5 h-5 text-red-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Danh mục: {material.category}
                          </p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-gray-600">
                              Tồn kho: <span className="font-semibold">{material.currentStock} {material.unit}</span>
                            </span>
                            <span className="text-gray-600">
                              Tối thiểu: {material.minStock} {material.unit}
                            </span>
                            <span className="text-gray-600">
                              Giá: {material.price.toLocaleString('vi-VN')}đ/{material.unit}
                            </span>
                          </div>
                        </div>
                        {isLowStock && (
                          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                            Cần nhập thêm
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Material Usage History */}
              {materialUsage.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Lịch sử trừ kho tự động</h4>
                  <div className="space-y-2">
                    {materialUsage.map(usage => (
                      <div key={usage.id} className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{usage.materialName}</p>
                            <p className="text-sm text-gray-600">
                              Đã trừ: {usage.quantityUsed} {usage.unit}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">
                              {new Date(usage.usedAt).toLocaleString('vi-VN')}
                            </p>
                            <p className="text-xs text-gray-500">
                              Bởi: {staff.find(s => s.id === usage.staffId)?.name}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Inspection Tab */}
          {selectedTab === 'inspection' && (
            <div>
              {inspection ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Thông tin đồng kiểm
                    </h3>
                    <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                      ✓ Đã hoàn thành
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Người kiểm tra</p>
                      <p className="font-semibold text-gray-900">{inspection.inspector.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Thời gian</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(inspection.inspectionTime).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tình trạng chung</p>
                      <p className="font-semibold text-green-600">Tốt</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Số vết hư hỏng</p>
                      <p className="font-semibold text-gray-900">
                        {inspection.damages.length} vết
                      </p>
                    </div>
                  </div>

                  {inspection.damages.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Chi tiết hư hỏng:</h4>
                      <div className="space-y-3">
                        {inspection.damages.map(damage => (
                          <div key={damage.id} className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-start space-x-3">
                              <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-semibold text-gray-900">{damage.location}</h5>
                                  <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-semibold">
                                    {damage.type === 'SCRATCH' ? 'Xước' : 'Lõm'}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">{damage.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {inspection.notes && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <FileText className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="font-semibold text-gray-900 mb-1">Ghi chú:</p>
                          <p className="text-sm text-gray-700">{inspection.notes}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Chưa thực hiện đồng kiểm
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Cần thực hiện đồng kiểm trước khi bắt đầu dịch vụ
                  </p>
                  <button className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors">
                    Bắt đầu đồng kiểm
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Assign Staff Modal */}
      {showAssignModal && taskToAssign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                Giao việc: {taskToAssign.taskName}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Chọn nhân viên phù hợp để thực hiện công việc này
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Recommended Staff */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Nhân viên đề xuất (có chuyên môn phù hợp)
                </h4>
                <div className="space-y-2">
                  {staff
                    .filter(s => s.status === 'AVAILABLE')
                    .map(s => (
                      <button
                        key={s.id}
                        onClick={() => assignStaffToTask(s)}
                        className="w-full p-4 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                              {s.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{s.name}</p>
                              <p className="text-sm text-gray-600">
                                {specialtyLabels[s.specialty]} • {s.experience} năm kinh nghiệm
                              </p>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                            Rảnh
                          </span>
                        </div>
                      </button>
                    ))}
                </div>
              </div>

              {/* Busy Staff */}
              {staff.filter(s => s.status === 'BUSY').length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                    Nhân viên đang bận
                  </h4>
                  <div className="space-y-2">
                    {staff
                      .filter(s => s.status === 'BUSY')
                      .map(s => (
                        <div
                          key={s.id}
                          className="p-4 bg-gray-50 border border-gray-200 rounded-lg opacity-60"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-gray-400 text-white flex items-center justify-center font-bold">
                                {s.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{s.name}</p>
                                <p className="text-sm text-gray-600">
                                  {specialtyLabels[s.specialty]} • Đang bận
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setTaskToAssign(null);
                }}
                className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;
