const express = require("express");
const { getAllInspections, createInspection } = require("../controller/inspectionController");
const { authToken } = require("../middleware/authMiddleware");

const inspectionRoute = express.Router();

// inspectionRoute.use(authToken); // Yêu cầu đăng nhập

inspectionRoute.get("/", getAllInspections);
inspectionRoute.post("/:id", createInspection); // pass ticketId as id

module.exports = inspectionRoute;
