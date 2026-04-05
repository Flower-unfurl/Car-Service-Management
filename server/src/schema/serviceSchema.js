const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
    serviceName: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    vehicleType: {
        type: String,
        enum: ["CAR", "BIKE", "TRUCK", "OTHER"],
        default: "CAR"
    },
    durationMinutes: { type: Number, required: true, min: 0 },
    status: {
        type: String,
        enum: ["ACTIVE", "INACTIVE", "ARCHIVED"],
        default: "ACTIVE"
    },
    imageUrl: { type: [String], default: [] },
    longDescription: { type: [String], default: [] },
    features: { type: [String], default: [] }
}, {
    timestamps: true,
    collection: "services"
});

module.exports = mongoose.model("services", serviceSchema);
