const Brand = require('../schema/brand');

// Get all brands
const getAllBrands = async (req, res) => {
    try {
        const brands = await Brand.find().sort({ name: 1 });
        res.status(200).json(brands);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create a new brand
const createBrand = async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: "Brand name is required" });
    }

    try {
        const newBrand = new Brand({ name });
        await newBrand.save();
        res.status(201).json(newBrand);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: "Brand already exists" });
        }
        res.status(500).json({ message: err.message });
    }
};

// Seed initial brands
const seedBrands = async (req, res) => {
    const initialBrands = [
        "Toyota", "Honda", "Hyundai", "Kia", "VinFast",
        "Mazda", "Ford", "Mitsubishi", "Suzuki",
        "Mercedes-Benz", "BMW", "Audi", "Lexus"
    ];

    try {
        const existingBrands = await Brand.find();
        if (existingBrands.length === 0) {
            const brandObjects = initialBrands.map(name => ({ name }));
            await Brand.insertMany(brandObjects);
            return res.status(201).json({ message: "Brands seeded successfully", count: initialBrands.length });
        }
        res.status(200).json({ message: "Brands already exist, skipping seed" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getAllBrands,
    createBrand,
    seedBrands
};
