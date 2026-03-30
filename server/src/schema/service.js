const mongoose = require('mongoose')

const serviceSchema = new mongoose.Schema({
  serviceName: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  durationMinutes: Number,
  status: { type: String, default: 'ACTIVE' },
  vehicleType: String,
  imageUrl: [String],
  longDescription: [String],
  features: [String]
}, { 
  timestamps: true,
  collection: 'Service' // Explicitly set collection name to match database
})

module.exports = mongoose.model('Service', serviceSchema)
