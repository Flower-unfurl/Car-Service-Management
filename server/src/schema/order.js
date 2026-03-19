const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  customerPhone: String,
  customerName: String,
  licensePlate: String,
  brand: String,

  orderType: {
    type: String,
    enum: ['WALK_IN', 'BOOKING'],
    default: 'WALK_IN'
  },

  qrToken: String,

  status: {
    type: String,
    enum: ['PENDING', 'IN_PROGRESS', 'READY', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING'
  },

  paymentStatus: {
    type: String,
    enum: ['UNPAID', 'PAID'],
    default: 'UNPAID'
  }
}, { timestamps: true })

module.exports = mongoose.model('Order', orderSchema)