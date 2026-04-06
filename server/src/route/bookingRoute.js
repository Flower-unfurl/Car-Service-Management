var express = require('express');
var router = express.Router();
const { authToken: CheckLogin } = require("../middleware/authMiddleware");
let Appointment = require("../schema/appointmentSchema");
let Zone = require("../schema/zoneSchema");
let Service = require("../schema/serviceSchema");
let emailUtils = require("../util/emailUtils");
let ErrorException = require("../util/errorException");

// Create booking
router.post('/', async function (req, res, next) {
    try {
        const { customerName, phone, email, licensePlate, expectedTime, serviceIds } = req.body;

        if (!customerName || !phone || !licensePlate || !expectedTime || !serviceIds || !serviceIds.length) {
            throw new ErrorException(400, "Vui lòng cung cập đầy đủ thông tin đặt lịch.");
        }

        const bookingTime = new Date(expectedTime);
        if (bookingTime < new Date()) {
            throw new ErrorException(400, "Thời gian hẹn không thể ở quá khứ.");
        }

        // Lọc ID không hợp lệ và trùng lặp
        const uniqueServiceIds = (Array.isArray(serviceIds) ? serviceIds : [serviceIds])
            .filter(id => id && id !== "undefined" && id !== "null")
            .filter((value, index, self) => self.indexOf(value) === index);


        const services = await Service.find({ _id: { $in: uniqueServiceIds } });

        if (services.length === 0) {
            throw new ErrorException(400, "Không có dịch vụ hợp lệ nào được chọn.");
        }

        const totalDuration = services.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
        const endTime = new Date(bookingTime.getTime() + totalDuration * 60000);

        const allZones = await Zone.find({ status: { $ne: "MAINTENANCE" } });

        let assignedZone = null;
        for (const zone of allZones) {
            // Lấy tất cả lịch hẹn chưa hủy của khoang này trong khoảng 8 tiếng xung quanh để kiểm tra chéo
            const potentialOverlaps = await Appointment.find({
                zoneId: zone._id,
                status: { $ne: "CANCELLED" },
                expectedTime: {
                    $gte: new Date(bookingTime.getTime() - 8 * 60 * 60 * 1000),
                    $lt: endTime
                }
            }).populate("serviceIds");

            let hasOverlap = false;
            for (const appt of potentialOverlaps) {
                const apptStartTime = appt.expectedTime;
                const apptDuration = appt.serviceIds.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
                const apptEndTime = new Date(apptStartTime.getTime() + apptDuration * 60000);

                // Kiểm tra chồng lấn: (Bắt đầu 1 < Kết thúc 2) AND (Kết thúc 1 > Bắt đầu 2)
                if (apptStartTime < endTime && apptEndTime > bookingTime) {
                    hasOverlap = true;
                    break;
                }
            }

            if (!hasOverlap) {
                assignedZone = zone;
                break;
            }
        }

        if (!assignedZone) {
            throw new ErrorException(400, "Xin lỗi, hiện tại không còn khoang trống vào khung giờ này.");
        }

        const appointment = await Appointment.create({
            customerName,
            phone,
            email,
            licensePlate,
            expectedTime: bookingTime,
            serviceIds: uniqueServiceIds, // Dùng mảng đã lọc ID hợp lệ
            zoneId: assignedZone._id,
            status: "BOOKED"
        });

        if (email) {
            const totalPrice = services.reduce((sum, s) => sum + (s.price || 0), 0);
            await emailUtils.sendBookingConfirmEmail(email, {
                customerName,
                licensePlate,
                totalPrice,
                expectedTime: bookingTime,
                services: services.map(s => s.serviceName),
                zoneName: assignedZone.name
            });
        }

        res.status(201).json({
            message: "Đặt lịch thành công!",
            data: appointment
        });

    } catch (error) {
        next(error);
    }
});

// Get all appointments
router.get('/', async function (req, res, next) {
    try {
        const appointments = await Appointment.find()
            .populate("serviceIds")
            .populate("zoneId");
        res.status(200).json(appointments);
    } catch (error) {
        next(error);
    }
});

// Get available zones
router.get('/available-zones', async function (req, res, next) {
    try {
        const { expectedTime, serviceIds } = req.query;
        if (!expectedTime || !serviceIds) return res.status(200).json([]);

        const ids = (Array.isArray(serviceIds) ? serviceIds : [serviceIds])
            .filter(id => id && id !== "undefined" && id !== "null")
            .filter((value, index, self) => self.indexOf(value) === index);

        const bookingTime = new Date(expectedTime);
        const services = await Service.find({ _id: { $in: ids } });

        if (services.length === 0) return res.status(200).json([]);

        const totalDuration = services.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
        const endTime = new Date(bookingTime.getTime() + totalDuration * 60000);

        const allZones = await Zone.find({ status: { $ne: "MAINTENANCE" } });
        const availableZones = [];

        for (const zone of allZones) {
            const potentialOverlaps = await Appointment.find({
                zoneId: zone._id,
                status: { $ne: "CANCELLED" },
                expectedTime: {
                    $gte: new Date(bookingTime.getTime() - 8 * 60 * 60 * 1000),
                    $lt: endTime
                }
            }).populate("serviceIds");

            let hasOverlap = false;
            for (const appt of potentialOverlaps) {
                const apptStartTime = appt.expectedTime;
                const apptDuration = appt.serviceIds.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
                const apptEndTime = new Date(apptStartTime.getTime() + apptDuration * 60000);

                if (apptStartTime < endTime && apptEndTime > bookingTime) {
                    hasOverlap = true;
                    break;
                }
            }
            if (!hasOverlap) availableZones.push(zone);
        }
        res.status(200).json(availableZones);
    } catch (error) {
        next(error);
    }
});

// Lookup appointments by license plate
router.get('/lookup/:licensePlate', async function (req, res, next) {
    try {
        const { licensePlate } = req.params;
        const appointments = await Appointment.find({ licensePlate })
            .populate("serviceIds")
            .populate("zoneId")
            .sort({ createdAt: -1 });
        res.status(200).json(appointments);
    } catch (error) {
        next(error);
    }
});

// Create zone
router.post('/zone', async function (req, res, next) {
    try {
        const { name, type, status } = req.body;
        if (!name || !type) {
            throw new ErrorException(400, "Vui lòng nhập tên và loại khoang.");
        }
        const zone = await Zone.create({ name, type, status });
        res.status(201).json({ message: "Thêm khoang thành công!", data: zone });
    } catch (error) {
        console.error("Create Zone Error:", error);
        res.status(500).json({
            message: "Lỗi khi tạo khoang",
            error: error.message
        });
    }
});

// Update appointment
router.put('/:id', async function (req, res, next) {
    try {
        const { id } = req.params;
        const updatedData = req.body;
        console.log(`Updating appointment ${id} with:`, updatedData);
        const appointment = await Appointment.findByIdAndUpdate(id, updatedData, { new: true });
        if (!appointment) throw new ErrorException(404, "Không tìm thấy lịch hẹn.");
        console.log(`Updated successfully:`, appointment.status);
        res.status(200).json({ message: "Cập nhật lịch hẹn thành công!", data: appointment });
    } catch (error) {
        console.error("Update error:", error);
        next(error);
    }
});

// Delete appointment
router.delete('/:id', async function (req, res, next) {
    try {
        const { id } = req.params;
        const appointment = await Appointment.findByIdAndDelete(id);
        if (!appointment) throw new ErrorException(404, "Không tìm thấy lịch hẹn.");
        res.status(200).json({ message: "Xóa lịch hẹn thành công!" });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
