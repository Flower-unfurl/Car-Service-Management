const express = require("express");
const { getAllInspections, createInspection } = require("../controller/inspectionController");
const { authToken, authRole } = require("../middleware/authMiddleware");

const inspectionRoute = express.Router();

// inspectionRoute.use(authToken); // Yêu cầu đăng nhập

inspectionRoute.get("/", getAllInspections);
inspectionRoute.post("/:id", createInspection); // pass ticketId as id

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
