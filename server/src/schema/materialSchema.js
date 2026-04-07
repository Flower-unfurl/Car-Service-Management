const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  materialName: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  },
  unit: { 
    type: String, 
    enum: ['Chai', 'Lít', 'Cái', 'Bộ', 'Thùng'], 
    required: true 
  },
  stockQuantity: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  minAlertLevel: { 
    type: Number, 
    default: 10 // Ngưỡng tối thiểu để hệ thống báo động
  },
  imageUrl: {
    type: String,
    default: ""
  },
  category: { 
    type: String // Ví dụ: 'Dầu nhớt', 'Phụ tùng', 'Hóa chất vệ sinh'
  }
}, { timestamps: true });


module.exports = mongoose.model('materials', materialSchema);