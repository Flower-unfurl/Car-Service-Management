const Inspection = require("../schema/inspectionSchema");
const Ticket = require("../schema/ticketSchema");

const inspectionService = {
    getAllInspections: async () => {
        return await Inspection.find().populate("ticket").sort({ createdAt: -1 });
    },

    getInspectionByTicketId: async (ticketId) => {
        return await Inspection.findOne({ ticket: ticketId });
    },

    createInspection: async (ticketId, inspectionData, userId) => {
        const newInspection = new Inspection({
            ...inspectionData,
            ticket: ticketId,
            inspectedBy: userId
        });

        const savedInspection = await newInspection.save();

        // Cập nhật lại ticket, đổi status và gắn ID inspection
        await Ticket.findByIdAndUpdate(ticketId, { 
            inspection: savedInspection._id,
            status: "IN_SERVICE"
        });

        return savedInspection;
    }
};

module.exports = inspectionService;
