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

        const userId = req.user ? req.user._id : null; 

        const ticket = await ticketService.createTicket(req.body, userId);
        
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
        const userId = req.user ? req.user._id : null;
        const entry = await ticketService.createFullEntry(req.body, userId);
        res.status(201).json({
            message: "Hoàn tất tiếp nhận và đồng kiểm xe",
            data: entry
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getTickets,
    getTicketById,
    createTicket,
    createFullEntry
};
