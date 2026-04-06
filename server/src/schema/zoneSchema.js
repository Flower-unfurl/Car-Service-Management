const mongoose = require("mongoose");

// const zoneSchema = new mongoose.Schema({
//     name: { type: String },
//     type: {
//         type: String,
//         enum: ["WASH", "REPAIR", "PAINT", "DETAILING"],
//         required: true
//     },
//     status: {
//         type: String,
//         enum: ["AVAILABLE", "OCCUPIED", "MAINTENANCE"],
//         default: "AVAILABLE"
//     }
// }, {
//     timestamps: true,
//     collection: "zones"
// });

const zoneSchema = new mongoose.Schema(
    {
        zoneName: { type: String, required: true, unique: true, trim: true },
        capacity: { type: Number, required: true, min: 1, default: 1 },
        occupied: { type: Number, default: 0, min: 0 },
        availableSlots: { type: Number, default: 1, min: 0 },
        status: {
            type: String,
            enum: ["AVAILABLE", "FULL", "MAINTENANCE"],
            default: "AVAILABLE"
        }
    },
    {
        timestamps: true,
        collection: "zones"
    }
);

module.exports = mongoose.model("zones", zoneSchema);
