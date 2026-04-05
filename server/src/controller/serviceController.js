const serviceService = require("../service/serviceService");

const getServices = async (req, res) => {
    try {
        const services = await serviceService.getAllServices();
        res.status(200).json({ data: services });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getServiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await serviceService.getServiceById(id);

        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        res.status(200).json({ data: service });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createService = async (req, res) => {
    try {
        const serviceData = req.body;
        const createdService = await serviceService.createService(serviceData);
        res.status(201).json({ message: "Service created successfully", data: createdService });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const updatedService = await serviceService.updateService(id, updateData);

        if (!updatedService) {
            return res.status(404).json({ message: "Service not found" });
        }

        res.status(200).json({ message: "Service updated successfully", data: updatedService });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedService = await serviceService.deleteService(id);

        if (!deletedService) {
            return res.status(404).json({ message: "Service not found" });
        }

        res.status(200).json({ message: "Service deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getServices,
    getServiceById,
    createService,
    updateService,
    deleteService
};
