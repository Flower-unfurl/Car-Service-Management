const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
    {
        brandName: { type: String, required: true, unique: true, trim: true },
        models: [{ type: String, trim: true }]
    },
    {
        timestamps: true,
        collection: "brands"
    }
);

// Pre-save hook for normalization
brandSchema.pre("save", function(next) {
    if (this.brandName) {
        this.brandName = this.brandName.trim().toUpperCase();
    }
    if (this.models && this.models.length > 0) {
        this.models = this.models.map(model => model.trim().toUpperCase());
    }
    next();
});

module.exports = mongoose.model("brands", brandSchema);
