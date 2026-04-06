const mongoose = require("mongoose");

const zoneSchema = new mongoose.Schema({
    name: { type: String },
    type: {
        type: String,
        enum: ["WASH", "REPAIR", "PAINT", "DETAILING"],
        required: true
    },
    status: {
        type: String,
        enum: ["AVAILABLE", "OCCUPIED", "MAINTENANCE"],
        default: "AVAILABLE"
    }
}, {
    timestamps: true,
    collection: "zones"
});

module.exports = mongoose.model("zones", zoneSchema);
