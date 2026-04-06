const inspectionService = require("../service/inspectionService");
const ErrorException = require("../util/errorException");

const getAllInspections = async (req, res, next) => {
    try {
        const inspections = await inspectionService.getAllInspections();
        res.status(200).json({ data: inspections });
    } catch (error) {
        next(error);
    }
};

const createInspection = async (req, res, next) => {
    try {
        const { id } = req.params; // ticketId
        const userId = req.user ? req.user._id : null;

        const inspection = await inspectionService.createInspection(id, req.body, userId);

        res.status(201).json({
            message: "Lưu thông tin đồng kiểm thành công",
            data: inspection
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllInspections,
    createInspection
};
