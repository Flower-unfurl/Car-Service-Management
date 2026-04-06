const Brand = require("../schema/brandSchema");

const brandService = {
    getAllBrands: async () => {
        return await Brand.find().sort({ brandName: 1 });
    },

    getBrandById: async (id) => {
        return await Brand.findById(id);
    },

    createBrand: async (brandData) => {
        // Normalization via pre-save hook
        const newBrand = new Brand(brandData);
        return await newBrand.save();
    },

    updateBrand: async (id, brandData) => {
        // Can manually normalize or use pre-save hooks (update by findOne and save or use individual fields)
        const brand = await Brand.findById(id);
        if (!brand) return null;
        
        if (brandData.brandName) brand.brandName = brandData.brandName.trim().toUpperCase();
        if (brandData.models) brand.models = brandData.models.map(m => m.trim().toUpperCase());
        
        return await brand.save();
    },

    deleteBrand: async (id) => {
        return await Brand.findByIdAndDelete(id);
    }
};

module.exports = brandService;
