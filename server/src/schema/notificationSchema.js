const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    type: {
        type: String,
        enum: ["SYSTEM", "TASK", "INVENTORY"],
        default: "SYSTEM"
    },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false }
}, {
    timestamps: true,
    collection: "notifications"
});

module.exports = mongoose.model("notifications", notificationSchema);
