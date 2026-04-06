const mongoose = require("mongoose");

// ================= INSPECTION SCHEMA =================
// Đồng kiểm - xác nhận tình trạng xe trước khi làm dịch vụ
const inspectionSchema = new mongoose.Schema(
    {
        // Liên kết phiếu xe
        ticket: { type: mongoose.Schema.Types.ObjectId, ref: "tickets", required: true },

        // Tình trạng xe (mô tả bằng văn bản)
        condition: {
            type: String,
            trim: true,
            default: ""
        },

        // Danh sách vị trí hư hỏng/trầy xước (có thể nhiều điểm)
        damages: [
            {
                area: {
                    type: String,
                    enum: [
                        "FRONT_LEFT", "FRONT_RIGHT",
                        "REAR_LEFT", "REAR_RIGHT",
                        "HOOD", "TRUNK", "ROOF",
                        "FRONT_BUMPER", "REAR_BUMPER",
                        "WINDSHIELD", "REAR_GLASS",
                        "INTERIOR", "OTHER"
                    ]
                },
                description: { type: String, trim: true },
                severity: {
                    type: String,
                    enum: ["MINOR", "MODERATE", "SEVERE", "BROKEN", "NEW"],
                    default: "NEW"
                }
            }
        ],

        // Ảnh chụp hiện trạng
        photos: { type: [String], default: [] },

        // Số km hiện tại
        odometer: { type: Number, min: 0, default: 0 },

        // Nhiên liệu (0-100%)
        fuelLevel: { type: Number, min: 0, max: 100, default: 0 },

        // Xác nhận của khách hàng
        customerConfirmed: { type: Boolean, default: false },
        customerSignature: { type: String, default: "" },

        // Người đồng kiểm (nhân viên)
        inspectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },

        // Thời điểm đồng kiểm
        inspectedAt: { type: Date, default: Date.now },

        // Ghi chú thêm
        note: { type: String, trim: true, default: "" }
    },
    {
        timestamps: true,
        collection: "inspections"
    }
);

module.exports = mongoose.model("inspections", inspectionSchema);
