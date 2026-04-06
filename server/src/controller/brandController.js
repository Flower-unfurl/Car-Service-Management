const brandService = require("../service/brandService");
const ErrorException = require("../util/errorException");

const getAllBrands = async (req, res, next) => {
    try {
        const brands = await brandService.getAllBrands();
        res.status(200).json({ data: brands });
    } catch (error) {
        next(error);
    }
};

const createBrand = async (req, res, next) => {
    try {
        const { brandName } = req.body;
        if (!brandName) throw new ErrorException(400, "Brand name is required");
        
        const newBrand = await brandService.createBrand(req.body);
        res.status(201).json({ message: "Brand created successfully", data: newBrand });
    } catch (error) {
        if (error.code === 11000) return next(new ErrorException(400, "Brand already exists"));
        next(error);
    }
};

const updateBrand = async (req, res, next) => {
    try {
        const updatedBrand = await brandService.updateBrand(req.params.id, req.body);
        if (!updatedBrand) throw new ErrorException(404, "Brand not found");
        res.status(200).json({ message: "Brand updated successfully", data: updatedBrand });
    } catch (error) {
        next(error);
    }
};

const deleteBrand = async (req, res, next) => {
    try {
        const deleted = await brandService.deleteBrand(req.params.id);
        if (!deleted) throw new ErrorException(404, "Brand not found");
        res.status(200).json({ message: "Brand deleted successfully" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllBrands,
    createBrand,
    updateBrand,
    deleteBrand
};
