const Service = require("../schema/serviceSchema");

const serviceService = {
    getAllServices: async (filter = {}) => {
        return await Service.find(filter).sort({ createdAt: -1 });
    },

    getServiceById: async (serviceId) => {
        return await Service.findById(serviceId);
    },

    createService: async (serviceData) => {
        const newService = new Service(serviceData);
        return await newService.save();
    },

    updateService: async (serviceId, updateData) => {
        return await Service.findByIdAndUpdate(serviceId, updateData, {
            new: true,
            runValidators: true
        });
    },

    deleteService: async (serviceId) => {
        return await Service.findByIdAndDelete(serviceId);
    }
};

module.exports = serviceService;
