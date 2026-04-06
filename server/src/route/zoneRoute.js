const express = require("express");
const { getAllZones, getAvailableZones, createZone, updateZone, deleteZone } = require("../controller/zoneController");
const { authToken, authRole } = require("../middleware/authMiddleware");

const zoneRoute = express.Router();

zoneRoute.get("/available", getAvailableZones);
zoneRoute.get("/", getAllZones);

// Quyền Admin cho CRUD. 
// Nếu module authRole của bạn đang dùng enum ADMIN, truyền "ADMIN".
zoneRoute.post("/", createZone);
zoneRoute.put("/:id", updateZone);
zoneRoute.delete("/:id", deleteZone);

module.exports = zoneRoute;
