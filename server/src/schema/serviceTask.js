const mongoose = require('mongoose')

const serviceTaskSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },

  stepOrder: Number,

  status: {
    type: String,
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
    default: 'PENDING'
  }
})

module.exports = mongoose.model('ServiceTask', serviceTaskSchema)