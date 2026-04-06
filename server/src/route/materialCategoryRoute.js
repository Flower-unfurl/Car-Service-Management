var express = require("express");
var router = express.Router();

const MaterialCategory = require("../schema/materialCategory");


// =========================
// 1. GET ALL
// =========================
router.get("/",    async (req, res) => {
    try {
        let data = await MaterialCategory.find().sort({ createdAt: -1 });
        res.send(data);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});


// =========================
// 2. CREATE
// =========================
router.post("/",    async (req, res) => {
    try {
        let { name } = req.body;

        if (!name) {
            return res.status(400).send({ message: "Name is required" });
        }

        let existed = await MaterialCategory.findOne({ name });
        if (existed) {
            return res.status(400).send({ message: "Category already exists" });
        }

        let newItem = new MaterialCategory({ name });
        await newItem.save();

        res.send(newItem);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});


// =========================
// 3. UPDATE
// =========================
router.put("/:id",    async (req, res) => {
    try {
        let { name } = req.body;

        let item = await MaterialCategory.findById(req.params.id);
        if (!item) {
            return res.status(404).send({ message: "Not found" });
        }

        if (name) item.name = name;

        await item.save();

        res.send(item);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});


// =========================
// 4. DELETE
// =========================
router.delete("/:id",    async (req, res) => {
    try {
        let item = await MaterialCategory.findById(req.params.id);

        if (!item) {
            return res.status(404).send({ message: "Not found" });
        }

        await MaterialCategory.deleteOne({ _id: req.params.id });

        res.send({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

module.exports = router;