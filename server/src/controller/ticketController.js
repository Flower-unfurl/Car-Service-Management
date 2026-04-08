const ticketService = require("../service/ticketService");
const ErrorException = require("../util/errorException");

const getTickets = async (req, res, next) => {
    try {
        const tickets = await ticketService.getAllTickets();
        res.status(200).json({ data: tickets });
    } catch (error) {
        next(error);
    }
};

const getTicketById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const ticket = await ticketService.getTicketById(id);
        if (!ticket) throw new ErrorException(404, "Ticket not found");
        res.status(200).json({ data: ticket });
    } catch (error) {
        next(error);
    }
};

const createTicket = async (req, res, next) => {
    try {
        const { licensePlate } = req.body;
        
        if (!licensePlate) {
            throw new ErrorException(400, "Vui lòng nhập biển số xe");
        }

        const ticket = await ticketService.createTicket(req.body, req.user || null);
        
        res.status(201).json({
            message: "Tạo phiếu tiếp nhận thành công",
            data: ticket
        });
    } catch (error) {
        next(error);
    }
};

const createFullEntry = async (req, res, next) => {
    try {
        const entry = await ticketService.createFullEntry(req.body, req.user || null);
        res.status(201).json({
            message: "Hoàn tất tiếp nhận và đồng kiểm xe",
            data: entry
        });
    } catch (error) {
        next(error);
    }
};

const addServicesToTicketFlow = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { serviceIds } = req.body;

        const result = await ticketService.addServicesToTicketFlow(id, serviceIds, req.user || null);
        res.status(200).json({
            message: "Đã tạo service order và service tasks",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getTicketInvoice = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = await ticketService.getTicketInvoice(id);
        res.status(200).json({ data });
    } catch (error) {
        next(error);
    }
};

const confirmInvoice = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { includeParkingFee } = req.body;
        const invoice = await ticketService.confirmInvoice(id, req.user?._id || null, includeParkingFee);

        res.status(200).json({
            message: "Xác nhận hóa đơn thành công",
            data: invoice
        });
    } catch (error) {
        next(error);
    }
};

const confirmInvoicePayment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { includeParkingFee } = req.body;
        const invoice = await ticketService.confirmInvoicePayment(id, req.user?._id || null, includeParkingFee);

        res.status(200).json({
            message: "Xác nhận thanh toán tiền mặt thành công",
            data: invoice
        });
    } catch (error) {
        next(error);
    }
};

const getGuestInvoiceByQrToken = async (req, res, next) => {
    try {
        const { qrToken } = req.params;
        const data = await ticketService.getPublicInvoiceByQrToken(qrToken);

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getTickets,
    getTicketById,
    createTicket,
    createFullEntry,
    addServicesToTicketFlow,
    getTicketInvoice,
    confirmInvoice,
    confirmInvoicePayment,
    getGuestInvoiceByQrToken
};
