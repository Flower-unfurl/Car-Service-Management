const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    id: { type: String, unique: true }, 
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: String,
    phone: String,
    role: {
        type: String,
        enum: ["USER", "ADMIN", "STAFF"],
        default: "USER"
    },
    specialty: {
        type: String,
        enum: ["INSPECTION", "CAR_WASH", "INTERIOR", "POLISHING", "MAINTENANCE", "REPAIR", null],
        default: null
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    refreshToken: String
}, { 
    timestamps: true,
    collection: "users" // 👈 thêm dòng này
});

module.exports = mongoose.model("users", userSchema);