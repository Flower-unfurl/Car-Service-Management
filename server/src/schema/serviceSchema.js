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
    features: { type: [String], default: [] },
    materials: {
        type: [
            {
                materialId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "materials",
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 0.01,
                },
            },
        ],
        default: [],
    },
    materialUsages: {
        type: [
            {
                materialId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "materials",
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 0.01,
                },
            },
        ],
        default: [],
    },
}, {
    timestamps: true,
    collection: "services"
});

module.exports = mongoose.model("services", serviceSchema);
