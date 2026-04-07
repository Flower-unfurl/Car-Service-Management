const Material = require("../schema/materialSchema");
const ErrorException = require("../util/errorException");

const materialService = {
    // Get all materials with optional filter
    getAllMaterials: async (filter = {}) => {
        return await Material.find(filter).sort({ materialName: 1 });
    },

    // Get materials that are low on stock
    getLowStockMaterials: async () => {
        return await Material.find({
            $expr: { $lt: ["$stockQuantity", "$minAlertLevel"] }
        }).sort({ stockQuantity: 1 });
    },

    // Get single material by ID
    getMaterialById: async (materialId) => {
        const material = await Material.findById(materialId);
        if (!material) {
            throw new ErrorException(404, "Material not found");
        }
        return material;
    },

    // Create new material
    createMaterial: async (materialData) => {
        const existingMaterial = await Material.findOne({ 
            materialName: materialData.materialName 
        });
        
        if (existingMaterial) {
            throw new ErrorException(400, "Material with this name already exists");
        }

        const newMaterial = new Material(materialData);
        return await newMaterial.save();
    },

    // Update material
    updateMaterial: async (materialId, updateData) => {
        const material = await Material.findByIdAndUpdate(
            materialId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!material) {
            throw new ErrorException(404, "Material not found");
        }

        return material;
    },

    // Delete material
    deleteMaterial: async (materialId) => {
        const material = await Material.findByIdAndDelete(materialId);
        if (!material) {
            throw new ErrorException(404, "Material not found");
        }
        return material;
    },

    // Deduct stock (called when task completes)
    deductStock: async (materialId, quantity) => {
        const material = await Material.findById(materialId);
        
        if (!material) {
            throw new ErrorException(404, "Material not found");
        }

        if (material.stockQuantity < quantity) {
            throw new ErrorException(400, 
                `Insufficient stock for ${material.materialName}. Available: ${material.stockQuantity}, Required: ${quantity}`
            );
        }

        material.stockQuantity -= quantity;
        await material.save();

        // Check if stock is now below alert level
        const isLowStock = material.stockQuantity < material.minAlertLevel;

        return {
            material,
            isLowStock,
            remainingStock: material.stockQuantity
        };
    },

    // Add stock (restock)
    addStock: async (materialId, quantity) => {
        const material = await Material.findById(materialId);
        
        if (!material) {
            throw new ErrorException(404, "Material not found");
        }

        material.stockQuantity += quantity;
        await material.save();

        return material;
    },

    // Check if materials are available for a service
    checkMaterialsAvailability: async (materialsRequired) => {
        const unavailableMaterials = [];

        for (const { materialId, quantity } of materialsRequired) {
            const material = await Material.findById(materialId);
            
            if (!material) {
                unavailableMaterials.push({
                    materialId,
                    reason: "Material not found"
                });
                continue;
            }

            if (material.stockQuantity < quantity) {
                unavailableMaterials.push({
                    materialId,
                    materialName: material.materialName,
                    required: quantity,
                    available: material.stockQuantity,
                    reason: "Insufficient stock"
                });
            }
        }

        return {
            available: unavailableMaterials.length === 0,
            unavailableMaterials
        };
    }
};

module.exports = materialService;
