const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    licensePlate: { type: String },
    expectedTime: { type: Date, required: true },
    serviceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "services" }],
    zoneId: { type: mongoose.Schema.Types.ObjectId, ref: "zones" },
    ticketId: { type: String }, // Lưu mã ticket nếu có
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", default: null }, // Link đến người dùng
    status: {
        type: String,
        enum: ["BOOKED", "ARRIVED", "CANCELLED"],
        default: "BOOKED"
    },
    reminderSent: { type: Boolean, default: false }
}, {
    timestamps: true,
    collection: "appointments"
});

module.exports = mongoose.model("appointments", appointmentSchema);
