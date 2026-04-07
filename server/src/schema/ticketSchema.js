const mongoose = require("mongoose");

// ================= TICKET SCHEMA =================
// Phiếu gửi xe - quản lý xe vào/ra bãi
const ticketSchema = new mongoose.Schema(
    {
        // Thông tin xe
        licensePlate: { type: String, required: true, uppercase: true, trim: true },
        vehicleType: {
            type: String,
            enum: ["CAR", "BIKE", "TRUCK", "OTHER"],
            default: "CAR"
        },
        brand: { type: String, trim: true },
        model: { type: String, trim: true },
        color: { type: String, trim: true },

        // Thông tin khách hàng
        customerName: { type: String, trim: true },
        customerPhone: { type: String, trim: true },

        // Ảnh xe (AI chụp)
        imageUrl: { type: String, default: "" },

        // Phân bổ khu vực
        zone: { type: String, trim: true },

        // Thời gian
        checkinAt: { type: Date, default: Date.now },
        checkoutAt: { type: Date, default: null },

        // QR tracking
        qrToken: { type: String, unique: true, sparse: true },

        // Loại phiếu
        ticketType: {
            type: String,
            enum: ["PARKING", "SERVICE"],
            default: "SERVICE"
        },

        // Trạng thái
        status: {
            type: String,
            enum: ["ACTIVE", "IN_SERVICE", "READY_FOR_PICKUP", "COMPLETED"],
            default: "ACTIVE"
        },

        // Giá gửi xe
        parkingFee: { type: Number, default: 0, min: 0 },

        // Người tạo phiếu (lễ tân)
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },

        // Liên kết đồng kiểm
        inspection: { type: mongoose.Schema.Types.ObjectId, ref: "inspections", default: null },

        // Ghi chú
        note: { type: String, trim: true, default: "" }
    },
    {
        timestamps: true,
        collection: "tickets"
    }
);

module.exports = mongoose.model("tickets", ticketSchema);
