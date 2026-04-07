const Service = require("../schema/serviceSchema");

const getAllServices = async ({ page, limit }) => {
    const skip = page * limit;
    const services = await Service.find()
        .populate("materials.materialId", "materialName unit category")
        .populate("materialUsages.materialId", "materialName unit category")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
    const total = await Service.countDocuments();
    return { services, total };
};

const getAllServicesForDropdown = async () => {
    // Chỉ lấy _id, serviceName và price để tối ưu hiệu năng cho dropdown
    return await Service.find({}, "_id serviceName price slug");
};

const getServiceById = async (id) => {
    // Trả về toàn bộ object bao gồm longDescription, features, imageUrl...
    return await Service.findById(id)
        .populate("materials.materialId", "materialName unit category")
        .populate("materialUsages.materialId", "materialName unit category");
};

const createService = async (serviceData) => {
    const newService = new Service(serviceData);
    return await newService.save();
};

const updateService = async (id, updateData) => {
    return await Service.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
    });
};

const deleteService = async (id) => {
    return await Service.findByIdAndDelete(id);
};

module.exports = {
    getAllServices,
    getServiceById,
    createService,
    updateService,
    deleteService,
    getAllServicesForDropdown
};