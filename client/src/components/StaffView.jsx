import { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Play, AlertTriangle, Package } from 'lucide-react';
import { mockServiceTasks, taskStatusLabels, mockMaterialUsage } from '../../mockOperationsData';

const StaffView = ({ booking }) => {
  const [tasks, setTasks] = useState([]);
  const [currentTask, setCurrentTask] = useState(null);

  useEffect(() => {
    const bookingTasks = mockServiceTasks[booking.id] || [];
    setTasks(bookingTasks);
    
    // Tìm công việc đầu tiên chưa hoàn thành
    const nextTask = bookingTasks.find(t => t.status !== 'COMPLETED');
    setCurrentTask(nextTask);
  }, [booking.id]);

  const canStartTask = (task) => {
    if (task.stepOrder === 1) return true;
    
    // Kiểm tra tất cả các bước trước đã hoàn thành chưa
    const previousTasks = tasks.filter(t => t.stepOrder < task.stepOrder);
    return previousTasks.every(t => t.status === 'COMPLETED');
  };

  const handleStartTask = (task) => {
    if (!canStartTask(task)) {
      alert('Bạn phải hoàn thành các bước trước đó!');
      return;
    }
    
    // Simulate start task
    setTasks(prevTasks => 
      prevTasks.map(t => 
        t.id === task.id 
          ? { ...t, status: 'IN_PROGRESS', startTime: new Date().toISOString() }
          : t
      )
    );
    setCurrentTask(task);
  };

  const handleCompleteTask = (task) => {
    // Simulate complete task with material deduction
    const completedTime = new Date().toISOString();
    
    setTasks(prevTasks => 
      prevTasks.map(t => 
        t.id === task.id 
          ? { 
              ...t, 
              status: 'COMPLETED', 
              endTime: completedTime,
              actualMinutes: Math.ceil((new Date(completedTime) - new Date(t.startTime)) / 60000)
            }
          : t
      )
    );

    // Show materials used
    if (task.materials && task.materials.length > 0) {
      const materialsList = task.materials.map(m => `${m.name}: ${m.quantity} ${m.unit}`).join(', ');
      alert(`✅ Công việc hoàn thành!\n\nVật tư đã trừ tự động:\n${materialsList}`);
    } else {
      alert('✅ Công việc hoàn thành!');
    }

    // Find next task
    const nextTask = tasks.find(t => t.stepOrder === task.stepOrder + 1);
    setCurrentTask(nextTask || null);
  };

  return (
    <div className="space-y-6">
      {/* Current Task Card */}
      {currentTask && (
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-blue-100 text-sm mb-1">Công việc hiện tại</p>
              <h2 className="text-2xl font-bold">{currentTask.taskName}</h2>
              <p className="text-blue-100 mt-2">{currentTask.description}</p>
            </div>
            <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
              Bước {currentTask.stepOrder}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {currentTask.estimatedMinutes} phút
              </span>
              {currentTask.materials && currentTask.materials.length > 0 && (
                <span className="flex items-center">
                  <Package className="w-4 h-4 mr-1" />
                  {currentTask.materials.length} vật tư
                </span>
              )}
            </div>

            {currentTask.status === 'PENDING' && canStartTask(currentTask) && (
              <button
                onClick={() => handleStartTask(currentTask)}
                className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center space-x-2"
              >
                <Play className="w-5 h-5" />
                <span>Bắt đầu</span>
              </button>
            )}

            {currentTask.status === 'IN_PROGRESS' && (
              <button
                onClick={() => handleCompleteTask(currentTask)}
                className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center space-x-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Hoàn thành</span>
              </button>
            )}
          </div>

          {/* Materials Required */}
          {currentTask.materials && currentTask.materials.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-sm font-semibold mb-2">Vật tư cần dùng:</p>
              <div className="grid grid-cols-2 gap-2">
                {currentTask.materials.map(material => (
                  <div key={material.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                    <p className="text-sm font-medium">{material.name}</p>
                    <p className="text-xs text-blue-100">
                      {material.quantity} {material.unit}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Task List */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          Danh sách công việc (Thực hiện tuần tự)
        </h3>

        <div className="space-y-3">
          {tasks.map((task) => {
            const isBlocked = !canStartTask(task) && task.status === 'PENDING';
            
            return (
              <div
                key={task.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  task.status === 'COMPLETED'
                    ? 'bg-green-50 border-green-200'
                    : task.status === 'IN_PROGRESS'
                    ? 'bg-blue-50 border-blue-300 shadow-md'
                    : isBlocked
                    ? 'bg-gray-50 border-gray-200 opacity-50'
                    : 'bg-white border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {/* Step Number */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      task.status === 'COMPLETED'
                        ? 'bg-green-500 text-white'
                        : task.status === 'IN_PROGRESS'
                        ? 'bg-blue-500 text-white'
                        : isBlocked
                        ? 'bg-gray-300 text-gray-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {task.status === 'COMPLETED' ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        task.stepOrder
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{task.taskName}</h4>
                        {isBlocked && (
                          <span className="flex items-center text-xs text-amber-600">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Chờ bước trước
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {task.actualMinutes || task.estimatedMinutes} phút
                        </span>
                        {task.assignedStaff && (
                          <span className="flex items-center">
                            <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs mr-1">
                              {task.assignedStaff.name.charAt(0)}
                            </span>
                            {task.assignedStaff.name}
                          </span>
                        )}
                      </div>

                      {/* Materials */}
                      {task.materials && task.materials.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {task.materials.map(material => (
                            <span
                              key={material.id}
                              className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs"
                            >
                              <Package className="w-3 h-3 mr-1" />
                              {material.name} ({material.quantity} {material.unit})
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="ml-4">
                    {task.status === 'PENDING' && canStartTask(task) && (
                      <button
                        onClick={() => handleStartTask(task)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors"
                      >
                        Bắt đầu
                      </button>
                    )}
                    {task.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => handleCompleteTask(task)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Hoàn thành</span>
                      </button>
                    )}
                    {task.status === 'COMPLETED' && (
                      <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">
                        ✓ Xong
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Lưu ý quan trọng</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Công việc phải thực hiện theo đúng thứ tự từ bước 1 đến bước cuối</li>
          <li>• Không thể bắt đầu bước tiếp theo nếu bước trước chưa hoàn thành</li>
          <li>• Khi hoàn thành công việc, vật tư sẽ tự động được trừ khỏi kho</li>
        </ul>
      </div>
    </div>
  );
};

export default StaffView;
