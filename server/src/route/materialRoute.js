const express = require("express");
const fs = require("fs");
const path = require("path");
const Material = require("../schema/materialSchema");
const { uploadMaterialImage } = require("../middleware/uploadMiddleware");

const router = express.Router();

const toNumberOrUndefined = (value) => {
    if (value === undefined || value === null || value === "") {
        return undefined;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
};

const toBoolean = (value) => {
    return value === true || value === "true" || value === "1";
};

const getUploadedImagePath = (file) => {
    if (!file?.filename) {
        return "";
    }

    return `/uploads/materials/${file.filename}`;
};

const removeUploadedMaterialImage = async (imageUrl) => {
    if (!imageUrl || typeof imageUrl !== "string") {
        return;
    }

    if (!imageUrl.startsWith("/uploads/materials/")) {
        return;
    }

    const relativePath = imageUrl.replace("/uploads/", "");
    const absolutePath = path.join(__dirname, "../../", relativePath);

    try {
        await fs.promises.unlink(absolutePath);
    } catch {
        // Ignore remove errors to keep delete/update flows resilient.
    }
};

// =========================
// 1. GET ALL MATERIALS
// =========================
router.get("/", async (_req, res) => {
    try {
        const materials = await Material.find().sort({ createdAt: -1 });
        res.send(materials);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

// =========================
// 2. LOW STOCK ALERT
// =========================
router.get("/low/alert", async (_req, res) => {
    try {
        const materials = await Material.find({
            $expr: { $lte: ["$stockQuantity", "$minAlertLevel"] },
        });

        res.send(materials);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

// =========================
// 3. GET MATERIAL BY ID
// =========================
router.get("/:id", async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);

        if (!material) {
            return res.status(404).send({ message: "Material not found" });
        }

        res.send(material);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

// =========================
// 4. CREATE MATERIAL
// =========================
router.post("/", uploadMaterialImage.single("image"), async (req, res) => {
    try {
        const materialName = typeof req.body.materialName === "string" ? req.body.materialName.trim() : "";
        const unit = typeof req.body.unit === "string" ? req.body.unit.trim() : "";
        const category = typeof req.body.category === "string" ? req.body.category.trim() : "";
        const stockQuantity = toNumberOrUndefined(req.body.stockQuantity);
        const minAlertLevel = toNumberOrUndefined(req.body.minAlertLevel);
        const imageUrlInput = typeof req.body.imageUrl === "string" ? req.body.imageUrl.trim() : "";

        if (!materialName || !unit) {
            return res.status(400).send({ message: "Missing required fields" });
        }

        const existed = await Material.findOne({ materialName: new RegExp(`^${materialName}$`, "i") });
        if (existed) {
            return res.status(400).send({ message: "Material already exists" });
        }

        const uploadedImage = getUploadedImagePath(req.file);

        const newMaterial = new Material({
            materialName,
            unit,
            stockQuantity: stockQuantity ?? 0,
            minAlertLevel: minAlertLevel ?? 10,
            category,
            imageUrl: uploadedImage || imageUrlInput || "",
        });

        await newMaterial.save();

        res.send(newMaterial);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

// =========================
// 5. UPDATE MATERIAL
// =========================
router.put("/:id", uploadMaterialImage.single("image"), async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);

        if (!material) {
            return res.status(404).send({ message: "Material not found" });
        }

        const materialName = typeof req.body.materialName === "string" ? req.body.materialName.trim() : "";
        const unit = typeof req.body.unit === "string" ? req.body.unit.trim() : "";
        const category = typeof req.body.category === "string" ? req.body.category.trim() : "";
        const stockQuantity = toNumberOrUndefined(req.body.stockQuantity);
        const minAlertLevel = toNumberOrUndefined(req.body.minAlertLevel);
        const imageUrlInput = typeof req.body.imageUrl === "string" ? req.body.imageUrl.trim() : "";
        const removeImage = toBoolean(req.body.removeImage);

        if (materialName && materialName.toLowerCase() !== (material.materialName || "").toLowerCase()) {
            const existed = await Material.findOne({
                materialName: new RegExp(`^${materialName}$`, "i"),
                _id: { $ne: material._id },
            });
            if (existed) {
                return res.status(400).send({ message: "Material already exists" });
            }
        }

        const uploadedImage = getUploadedImagePath(req.file);

        if (materialName) material.materialName = materialName;
        if (unit) material.unit = unit;
        if (stockQuantity !== undefined) material.stockQuantity = stockQuantity;
        if (minAlertLevel !== undefined) material.minAlertLevel = minAlertLevel;
        if (category) material.category = category;

        if (uploadedImage) {
            await removeUploadedMaterialImage(material.imageUrl);
            material.imageUrl = uploadedImage;
        } else if (removeImage) {
            await removeUploadedMaterialImage(material.imageUrl);
            material.imageUrl = "";
        } else if (imageUrlInput) {
            material.imageUrl = imageUrlInput;
        }

        await material.save();

        res.send(material);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

// =========================
// 6. DELETE MATERIAL
// =========================
router.delete("/:id", async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);

        if (!material) {
            return res.status(404).send({ message: "Material not found" });
        }

        await removeUploadedMaterialImage(material.imageUrl);
        await Material.deleteOne({ _id: req.params.id });

        res.send({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

// =========================
// 7. ADD STOCK (NHẬP KHO)
// =========================
router.put("/add-stock/:id", async (req, res) => {
    try {
        const quantity = toNumberOrUndefined(req.body.quantity);

        if (!quantity || quantity <= 0) {
            return res.status(400).send({ message: "Invalid quantity" });
        }

        const material = await Material.findById(req.params.id);

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
router.put("/use/:id", async (req, res) => {
    try {
        const quantity = toNumberOrUndefined(req.body.quantity);

        if (!quantity || quantity <= 0) {
            return res.status(400).send({ message: "Invalid quantity" });
        }

        const material = await Material.findById(req.params.id);

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
