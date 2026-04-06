const zoneService = require("../service/zoneService");
const ErrorException = require("../util/errorException");

const getAllZones = async (req, res, next) => {
    try {
        const zones = await zoneService.getAllZones();
        res.status(200).json({ data: zones });
    } catch (error) {
        next(error);
    }
};

const getAvailableZones = async (req, res, next) => {
    try {
        const zones = await zoneService.getAvailableZones();
        res.status(200).json({ data: zones });
    } catch (error) {
        next(error);
    }
};

const createZone = async (req, res, next) => {
    try {
        const { zoneName, capacity } = req.body;
        if (!zoneName) throw new ErrorException(400, "Vui lòng nhập tên khu vực (Zone Name)");
        
        const newZone = await zoneService.createZone(req.body);
        res.status(201).json({ message: "Tạo khu vực thành công", data: newZone });
    } catch (error) {
        if (error.code === 11000) return next(new ErrorException(400, "Tên khu vực đã tồn tại"));
        next(error);
    }
};

const updateZone = async (req, res, next) => {
    try {
        const updatedZone = await zoneService.updateZone(req.params.id, req.body);
        if (!updatedZone) throw new ErrorException(404, "Khu vực không tồn tại");
        
        res.status(200).json({ message: "Cập nhật khu vực thành công", data: updatedZone });
    } catch (error) {
        if (error.code === 11000) return next(new ErrorException(400, "Tên khu vực đã tồn tại"));
        next(error);
    }
};

const deleteZone = async (req, res, next) => {
    try {
        const deletedZone = await zoneService.deleteZone(req.params.id);
        if (!deletedZone) throw new ErrorException(404, "Khu vực không tồn tại");
        res.status(200).json({ message: "Xóa khu vực thành công" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllZones,
    getAvailableZones,
    createZone,
    updateZone,
    deleteZone
};
