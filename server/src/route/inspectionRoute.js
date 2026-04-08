const express = require("express");
const { getAllInspections, createInspection } = require("../controller/inspectionController");
const Inspection = require("../schema/inspectionSchema");
const Ticket = require("../schema/ticketSchema");
const { authToken, authRole } = require("../middleware/authMiddleware");

const inspectionRoute = express.Router();

// inspectionRoute.use(authToken); // Yêu cầu đăng nhập

inspectionRoute.get("/", async (req, res, next) => {
    try {
        const inspections = await Inspection.find().populate("ticket").sort({ createdAt: -1 });
        res.json({ data: inspections });
    } catch (err) {
        next(err);
    }
});

inspectionRoute.post("/:id", async (req, res, next) => {
    try {
        const ticketId = req.params.id;
        const userId = req.user?._id || null;

        const inspection = await new Inspection({
            ...req.body,
            ticket: ticketId,
            inspectedBy: userId
        }).save();

        await Ticket.findByIdAndUpdate(ticketId, {
            inspection: inspection._id,
            status: "IN_SERVICE"
        });

        res.status(201).json({
            message: "Lưu thông tin đồng kiểm thành công",
            data: inspection
        });
    } catch (err) {
        next(err);
    }
});

inspectionRoute.post("/inspection", authRole("CUSTOMER, EMPLOYEE"), async (req, res) => {
    try {
        let { ticketId, fuelLevel, scratchImages, customerSignature, notes } = req.body;

        if (!ticketId) {
            return res.status(400).send({ message: "Missing ticketId" });
        }

        let newInspection = new inspectionModel({
            ticketId,
            fuelLevel,
            scratchImages,
            customerSignature,
            notes
        });

        await newInspection.save();

        res.send(newInspection);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

module.exports = inspectionRoute;
