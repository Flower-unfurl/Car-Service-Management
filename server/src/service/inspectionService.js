const Inspection = require("../schema/inspectionSchema");
const Ticket = require("../schema/ticketSchema");

const inspectionService = {
    getAllInspections: async () => {
        return await Inspection.find().populate("ticket").sort({ createdAt: -1 });
    },

    getInspectionByTicketId: async (ticketId) => {
        return await Inspection.findOne({ ticket: ticketId });
    },

    createInspection: async (ticketId, inspectionData, userId, session) => {
        const newInspection = new Inspection({
            ...inspectionData,
            ticket: ticketId,
            inspectedBy: userId
        });

        const savedInspection = await newInspection.save({ session });

        await Ticket.findByIdAndUpdate(
            ticketId,
            {
                inspection: savedInspection._id,
                status: "IN_SERVICE"
            },
            { session }
        );

        return savedInspection;
    }
};

module.exports = inspectionService;
