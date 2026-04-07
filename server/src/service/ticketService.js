const Ticket = require("../schema/ticketSchema");
const crypto = require("crypto");
const zoneService = require("./zoneService");
const inspectionService = require("./inspectionService");

const ticketService = {
    getAllTickets: async () => {
        return await Ticket.find().populate("inspection").sort({ createdAt: -1 });
    },

    getTicketByQrToken: async (qrToken) => {
        if (!qrToken) {
            return null;
        }

        return await Ticket.findOne({ qrToken }).populate("inspection");
    },
    
    getTicketById: async (id) => {
        return await Ticket.findById(id).populate("inspection");
    },

    createTicket: async (ticketData, userId) => {
        const { zoneId } = ticketData;
        if (!zoneId) throw new Error("Chưa chọn khu vực (Zone)");
        
        // 1. Kiểm tra và chiếm chỗ trong zone
        const zone = await zoneService.occupyZone(zoneId);
        
        // 2. Tạo qrToken ẩn danh (random string)
        const qrToken = crypto.randomBytes(16).toString("hex");
        
        const newTicket = new Ticket({
            ...ticketData,
            zone: zone.zoneName, // Lưu tên hiển thị cho ticket
            qrToken,
            createdBy: userId
        });

        return await newTicket.save();
    },

    createFullEntry: async (fullData, userId) => {
        const { ticketData, inspectionData } = fullData;

        // 1. Tạo ticket (có occupy zone)
        const ticket = await ticketService.createTicket(ticketData, userId);

        // 2. Tạo inspection gắn với ticket vừa tạo thông qua inspectionService
        await inspectionService.createInspection(ticket._id, inspectionData, userId);

        // 3. Trả về kết quả hoàn thiện (ticket đã populate inspection)
        return await Ticket.findById(ticket._id).populate("inspection");
    }
};

module.exports = ticketService;
