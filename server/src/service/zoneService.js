const Zone = require("../schema/zoneSchema");

const zoneService = {
    getAllZones: async () => {
        return await Zone.find().sort({ createdAt: -1 });
    },

    getAvailableZones: async () => {
        return await Zone.find({
            status: "AVAILABLE",
            availableSlots: { $gt: 0 }
        }).lean();
    },

    getZoneById: async (id) => {
        return await Zone.findById(id);
    },

    createZone: async (zoneData) => {
        const newZone = new Zone(zoneData);
        return await newZone.save();
    },

    updateZone: async (id, zoneData) => {
        const zone = await Zone.findById(id);
        if (!zone) return null;

        let newStatus = zoneData.status || zone.status;
        let newCapacity = zoneData.capacity !== undefined ? zoneData.capacity : zone.capacity;
        let newOccupied = zoneData.occupied !== undefined ? zoneData.occupied : zone.occupied;
        let availableSlots = newCapacity - newOccupied;

        if (availableSlots === 0 && newStatus === "AVAILABLE") {
            newStatus = "FULL";
        } else if (availableSlots > 0 && newStatus === "FULL") {
            newStatus = "AVAILABLE";
        }

        return await Zone.findByIdAndUpdate(
            id,
            { ...zoneData, status: newStatus },
            { new: true, runValidators: true }
        );
    },

    deleteZone: async (id) => {
        return await Zone.findByIdAndDelete(id);
    },

    occupyZone: async (id, session) => {
        const zone = await Zone.findById(id).session(session);
        if (!zone) throw new Error("Zone không tồn tại");
        if (zone.occupied >= zone.capacity || zone.status !== "AVAILABLE") {
            throw new Error("Khu vực này đã đầy hoặc đang không khả dụng");
        }

        zone.occupied += 1;
        zone.availableSlots = zone.capacity - zone.occupied;
        if (zone.availableSlots === 0) {
            zone.status = "FULL";
        }
        await zone.save({ session });
        return zone;
    },

    // ✅ Xe ra (giảm occupied)
    releaseSlot: async (zoneId) => {
        const zone = await Zone.findById(zoneId);

        if (!zone) throw new Error("Zone not found");

        if (zone.occupied <= 0) {
            throw new Error("No vehicle to release");
        }

        zone.occupied -= 1;
        zone.availableSlots = zone.capacity - zone.occupied;

        if (zone.status === "FULL") {
            zone.status = "AVAILABLE";
        }

        return await zone.save();
    }

};

module.exports = zoneService;
