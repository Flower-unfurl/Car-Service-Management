const express = require("express");
const {
    getServices,
    getServiceById,
    createService,
    updateService,
    deleteService,
    getDropdownServices
} = require("../controller/serviceController");
const { uploadServiceImages } = require("../middleware/uploadMiddleware");
const { authToken, authRole } = require("../middleware/authMiddleware");

const serviceRoute = express.Router();

// serviceRoute.use(authToken)

serviceRoute.get("/", getServices);
serviceRoute.get('/dropdown', getDropdownServices);
serviceRoute.get("/:id", getServiceById);
serviceRoute.post("/", uploadServiceImages.array("images", 10), createService);
serviceRoute.put("/:id", uploadServiceImages.array("images", 10), updateService);
serviceRoute.delete("/:id", deleteService);

module.exports = serviceRoute;