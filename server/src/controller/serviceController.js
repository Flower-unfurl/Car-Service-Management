const serviceService = require("../service/serviceService");
const ErrorException = require("../util/errorException");

const getServices = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const limit = parseInt(req.query.limit) || 4;

        const { services, total } = await serviceService.getAllServices({ page, limit });

        res.status(200).json({
            data: services,
            total,
            page,
            limit,
            hasMore: (page + 1) * limit < total
        });
    } catch (error) {
        next(error);
    }
};

const getDropdownServices = async (req, res, next) => {
    try {
        const services = await serviceService.getAllServicesForDropdown();
        res.status(200).json({
            success: true,
            data: services
        });
    } catch (error) {
        next(error);
    }
};

const getServiceById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Kiểm tra định dạng ObjectId của MongoDB (nếu bạn dùng MongoDB)
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            throw new ErrorException(400, "Mã dịch vụ (ID) không hợp lệ.");
        }

        const service = await serviceService.getServiceById(id);

        if (!service) {
            throw new ErrorException(404, "Không tìm thấy dịch vụ yêu cầu.");
        }

        res.status(200).json({ 
            success: true,
            data: service 
        });
    } catch (error) {
        next(error);
    }
};

const createService = async (req, res, next) => {
    try {
        const serviceData = req.body;
        if (!serviceData.serviceName) {
            throw new ErrorException(400, "Tên dịch vụ là bắt buộc.");
        }
        const createdService = await serviceService.createService(serviceData);
        res.status(201).json({ 
            message: "Tạo dịch vụ thành công", 
            data: createdService 
        });
    } catch (error) {
        next(error);
    }
};

const updateService = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const updatedService = await serviceService.updateService(id, updateData);

        if (!updatedService) {
            throw new ErrorException(404, "Không tìm thấy dịch vụ để cập nhật.");
        }

        res.status(200).json({ 
            message: "Cập nhật dịch vụ thành công", 
            data: updatedService 
        });
    } catch (error) {
        next(error);
    }
};

const deleteService = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedService = await serviceService.deleteService(id);

        if (!deletedService) {
            throw new ErrorException(404, "Không tìm thấy dịch vụ để xóa.");
        }

        res.status(200).json({ message: "Xóa dịch vụ thành công." });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getServices,
    getServiceById,
    createService,
    updateService,
    deleteService,
    getDropdownServices
};