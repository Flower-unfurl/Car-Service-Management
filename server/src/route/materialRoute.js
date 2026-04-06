var express = require("express");
var router = express.Router();

const Material = require("../schema/materialSchema");
const { authToken, authRole } = require("../middleware/authMiddleware");

router.get("/", async (req, res) => {
    try {
        let materials = await Material.find().sort({ createdAt: -1 });
        res.send(materials);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});


// =========================
// 2. GET MATERIAL BY ID
// =========================
router.get("/:id",  async (req, res) => {
    try {
        let material = await Material.findById(req.params.id);

        if (!material) {
            return res.status(404).send({ message: "Material not found" });
        }

        res.send(material);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});


// =========================
// 3. CREATE MATERIAL
// =========================
router.post("/",   async (req, res) => {
    try {
        let { materialName, unit, stockQuantity, minAlertLevel, category } = req.body;

        if (!materialName || !unit) {
            return res.status(400).send({ message: "Missing required fields" });
        }

        let existed = await Material.findOne({ materialName });
        if (existed) {
            return res.status(400).send({ message: "Material already exists" });
        }

        let newMaterial = new Material({
            materialName,
            unit,
            stockQuantity,
            minAlertLevel,
            category
        });

        await newMaterial.save();

        res.send(newMaterial);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});


// =========================
// 4. UPDATE MATERIAL
// =========================
router.put("/:id",   async (req, res) => {
    try {
        let material = await Material.findById(req.params.id);

        if (!material) {
            return res.status(404).send({ message: "Material not found" });
        }

        let { materialName, unit, stockQuantity, minAlertLevel, category } = req.body;

        if (materialName) material.materialName = materialName;
        if (unit) material.unit = unit;
        if (stockQuantity !== undefined) material.stockQuantity = stockQuantity;
        if (minAlertLevel !== undefined) material.minAlertLevel = minAlertLevel;
        if (category) material.category = category;

        await material.save();

        res.send(material);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});


// =========================
// 5. DELETE MATERIAL
// =========================
router.delete("/:id",   async (req, res) => {
    try {
        let material = await Material.findById(req.params.id);

        if (!material) {
            return res.status(404).send({ message: "Material not found" });
        }

        await Material.deleteOne({ _id: req.params.id });

        res.send({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});


// =========================
// 6. LOW STOCK ALERT
// =========================
router.get("/low/alert",   async (req, res) => {
    try {
        let materials = await Material.find({
            $expr: { $lte: ["$stockQuantity", "$minAlertLevel"] }
        });

        res.send(materials);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});


// =========================
// 7. ADD STOCK (NHẬP KHO)
// =========================
router.put("/add-stock/:id",   async (req, res) => {
    try {
        let { quantity } = req.body;

        if (!quantity || quantity <= 0) {
            return res.status(400).send({ message: "Invalid quantity" });
        }

        let material = await Material.findById(req.params.id);

        if (!material) {
            return res.status(404).send({ message: "Material not found" });
        }

        material.stockQuantity += quantity;

        await material.save();

        res.send(material);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});


// =========================
// 8. TRỪ KHO (MANUAL - OPTIONAL)
// =========================
router.put("/use/:id",   async (req, res) => {
    try {
        let { quantity } = req.body;

        if (!quantity || quantity <= 0) {
            return res.status(400).send({ message: "Invalid quantity" });
        }

        let material = await Material.findById(req.params.id);

        if (!material) {
            return res.status(404).send({ message: "Material not found" });
        }

        if (material.stockQuantity < quantity) {
            return res.status(400).send({ message: "Not enough stock" });
        }

        material.stockQuantity -= quantity;

        await material.save();

        res.send(material);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

module.exports = router;