const express = require("express");
const {
    getServices,
    getServiceById,
    createService,
    updateService,
    deleteService
} = require("../controller/serviceController");
const { authToken, authRole } = require("../middleware/authMiddleware");

const serviceRoute = express.Router();

// serviceRoute.use(authToken)

serviceRoute.get("/", authRole("CUSTOMER"), getServices);
serviceRoute.get("/:id", getServiceById);
serviceRoute.post("/", createService);
serviceRoute.put("/:id", updateService);
serviceRoute.delete("/:id", deleteService);

module.exports = serviceRoute;