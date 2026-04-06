const express = require("express");
const { getAllBrands, createBrand, updateBrand, deleteBrand } = require("../controller/brandController");
const { authToken, authRole } = require("../middleware/authMiddleware");

const brandRoute = express.Router();

brandRoute.get("/", getAllBrands);
brandRoute.post("/", createBrand);
brandRoute.put("/:id", updateBrand);
brandRoute.delete("/:id", deleteBrand);

module.exports = brandRoute;
