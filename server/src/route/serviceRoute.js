const express = require("express");
const {
    getServices,
    getServiceById,
    createService,
    updateService,
    deleteService,
    getDropdownServices,
} = require("../controller/serviceController");
const { uploadServiceImages } = require("../middleware/uploadMiddleware");
const { authToken, authRole } = require("../middleware/authMiddleware");

const serviceRoute = express.Router();

// serviceRoute.use(authToken)

serviceRoute.get("/", async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const limit = parseInt(req.query.limit) || 4;
        console.log(page);

        const { services, total } = await serviceService.getAllServices({
            page,
            limit,
        });
        // console.log(page, services)
        res.status(200).json({
            data: services,
            total,
            page,
            limit,
            hasMore: (page + 1) * limit < total,
        });
    } catch (error) {
        next(error);
    }
});

serviceRoute.get("/dropdown", async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 4;

        const result = await serviceService.getAllServicesForDropdown(
            page,
            limit,
        );

        res.status(200).json({
            success: true,
            ...result,
        });
    } catch (error) {
        next(error);
    }
});

serviceRoute.get("/:id", getServiceById);
serviceRoute.post("/", uploadServiceImages.array("images", 10), createService);
serviceRoute.put(
    "/:id",
    uploadServiceImages.array("images", 10),
    updateService,
);
serviceRoute.delete("/:id", deleteService);

module.exports = serviceRoute;
