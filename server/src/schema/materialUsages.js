const mongoose = require('mongoose');

const materialUsageSchema = new mongoose.Schema({
  taskId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'serviceTasks',
    required: true 
  },
  materialId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'materials', 
    required: true 
  },
  quantityUsed: { 
    type: Number, 
    required: true,
    min: [1, 'Số lượng sử dụng phải lớn hơn 0']
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  performedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'users' // Nhân viên thực hiện xuất kho
  }
}, { timestamps: true });

module.exports = mongoose.model('materialUsage', materialUsageSchema);