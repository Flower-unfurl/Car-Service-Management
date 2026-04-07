const express = require("express");
const Zone = require("../schema/zoneSchema"); // sửa đúng path nếu cần
const { authToken, authRole } = require("../middleware/authMiddleware");

const zoneRoute = express.Router();

// ================= GET ALL =================
zoneRoute.get("/", async (req, res, next) => {
    try {
        const zones = await Zone.find().sort({ createdAt: -1 });
        res.status(200).json({ data: zones });
    } catch (error) {
        next(error);
    }
});

// ================= GET AVAILABLE =================
zoneRoute.get("/available", async (req, res, next) => {
    try {
        const zones = await Zone.find({ status: "AVAILABLE" });
        res.status(200).json({ data: zones });
    } catch (error) {
        next(error);
    }
});

// ================= CREATE =================
zoneRoute.post("/", authToken, authRole("admin"), async (req, res, next) => {
    try {
        const { zoneName, capacity } = req.body;

        if (!zoneName) {
            return res.status(400).json({ message: "Vui lòng nhập tên khu vực" });
        }

        const newZone = await Zone.create({
            zoneName,
            capacity,
            availableSlots: capacity
        });

        res.status(201).json({
            message: "Tạo khu vực thành công",
            data: newZone
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Tên khu vực đã tồn tại" });
        }
        next(error);
    }
});

// ================= UPDATE =================
zoneRoute.put("/:id", authToken, authRole("admin"), async (req, res, next) => {
    try {
        const zone = await Zone.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!zone) {
            return res.status(404).json({ message: "Khu vực không tồn tại" });
        }

        res.json({
            message: "Cập nhật thành công",
            data: zone
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Tên khu vực đã tồn tại" });
        }
        next(error);
    }
});

// ================= DELETE =================
zoneRoute.delete("/:id", authToken, authRole("admin"), async (req, res, next) => {
    try {
        const zone = await Zone.findByIdAndDelete(req.params.id);

        if (!zone) {
            return res.status(404).json({ message: "Không tìm thấy khu vực" });
        }

        res.json({ message: "Xóa thành công" });

    } catch (error) {
        next(error);
    }
});

module.exports = zoneRoute;