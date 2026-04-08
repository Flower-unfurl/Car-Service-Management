const express = require("express");
const Ticket = require("../schema/ticketSchema");
const Order = require("../schema/order");
const Service = require("../schema/serviceSchema");
const Zone = require("../schema/zoneSchema");
const crypto = require("crypto");
const { authToken, authRole } = require("../middleware/authMiddleware");
const ErrorException = require("../util/errorException");
const zoneService = require("../service/zoneService");
const inspectionService = require("../service/inspectionService");
const serviceTaskService = require("../service/serviceTaskService");

const router = express.Router();


const SERVICE_TICKET_TYPE = "SERVICE";
const ALLOWED_TICKET_TYPES = ["PARKING", "SERVICE"];

const normalizeTicketType = (value) => {
	if (typeof value !== "string") return SERVICE_TICKET_TYPE;
	const normalized = value.trim().toUpperCase();
	return ALLOWED_TICKET_TYPES.includes(normalized) ? normalized : null;
};

const normalizeServiceIds = (serviceIds) => {
	const list = Array.isArray(serviceIds) ? serviceIds : [];
	const seen = new Set();
	const result = [];
	for (const id of list) {
		const v = String(id || "").trim();
		if (!v || seen.has(v)) continue;
		seen.add(v);
		result.push(v);
	}
	return result;
};

const shouldAssignDefaultStaff = (actor) =>
	Boolean(actor && actor._id && actor.role === "STAFF");


// GET /guest/:qrToken/invoice — public
router.get("/guest/:qrToken/invoice", async (req, res, next) => {
	try {
		const ticket = await Ticket.findOne({ qrToken: req.params.qrToken }).populate("inspection");
		if (!ticket) throw new ErrorException(404, "Ticket not found");

		const invoice = await Order.findOne({
			ticketId: ticket._id,
			invoiceStatus: "CONFIRMED",
			isPublicForGuest: true
		})
			.sort({ createdAt: -1 })
			.populate("services.serviceId", "serviceName");

		if (!invoice) throw new ErrorException(404, "Invoice is not published yet");

		res.json({
			success: true,
			data: {
				ticket: {
					_id: ticket._id,
					licensePlate: ticket.licensePlate,
					status: ticket.status,
					ticketType: ticket.ticketType,
					checkinAt: ticket.checkinAt,
					checkoutAt: ticket.checkoutAt
				},
				invoice: {
					_id: invoice._id,
					services: invoice.services.map((item) => ({
						serviceId: item.serviceId?._id || item.serviceId,
						serviceName: item.serviceNameSnapshot || item.serviceId?.serviceName || "Dịch vụ",
						quantity: item.quantity,
						unitPrice: item.price,
						lineTotal: item.quantity * item.price,
						durationMinutes: item.durationMinutesSnapshot
					})),
					totalServiceFee: invoice.totalServiceFee,
					parkingFee: invoice.parkingFee,
					includeParkingFee: invoice.includeParkingFee,
					totalAmount: invoice.totalAmount,
					paymentStatus: invoice.paymentStatus,
					invoiceStatus: invoice.invoiceStatus,
					confirmedAt: invoice.invoiceConfirmedAt
				}
			}
		});
	} catch (err) {
		next(err);
	}
});

// ── Tất cả routes dưới đây yêu cầu đăng nhập ──────────────────────────────────
router.use(authToken);

// GET / — danh sách tickets
router.get("/", authRole("ADMIN", "STAFF"), async (req, res, next) => {
	try {
		const tickets = await Ticket.find().populate("inspection").sort({ createdAt: -1 });
		res.json({ data: tickets });
	} catch (err) {
		next(err);
	}
});

// POST / — tạo ticket đơn
router.post("/", authRole("ADMIN", "STAFF"), async (req, res, next) => {
	try {
		const { licensePlate, zoneId } = req.body;
		if (!licensePlate) throw new ErrorException(400, "Vui lòng nhập biển số xe");
		if (!zoneId) throw new ErrorException(400, "Chưa chọn khu vực (Zone)");

		const ticketType = normalizeTicketType(req.body.ticketType);
		if (!ticketType) throw new ErrorException(400, "Loại phiếu không hợp lệ. Chỉ chấp nhận PARKING hoặc SERVICE.");

		const zone = await zoneService.occupyZone(zoneId);
		const qrToken = crypto.randomBytes(16).toString("hex");

		const ticket = await new Ticket({
			...req.body,
			ticketType,
			zone: zone.zoneName,
			qrToken,
			createdBy: req.user?._id || null
		}).save();

		res.status(201).json({ message: "Tạo phiếu tiếp nhận thành công", data: ticket });
	} catch (err) {
		next(err);
	}
});

// POST /full-entry — tạo ticket + đồng kiểm + order + tasks cùng lúc
router.post("/full-entry", authRole("ADMIN", "STAFF"), async (req, res, next) => {
	try {
		const { ticketData = {}, inspectionData, serviceIds = [] } = req.body;
		const actor = req.user || null;

		// 1. Validate & tạo ticket
		const { zoneId, licensePlate } = ticketData;
		if (!licensePlate) throw new ErrorException(400, "Vui lòng nhập biển số xe");
		if (!zoneId) throw new ErrorException(400, "Chưa chọn khu vực (Zone)");

		const ticketType = normalizeTicketType(ticketData.ticketType);
		if (!ticketType) throw new ErrorException(400, "Loại phiếu không hợp lệ.");

		const zone = await zoneService.occupyZone(zoneId);
		const qrToken = crypto.randomBytes(16).toString("hex");

		const ticket = await new Ticket({
			...ticketData,
			ticketType,
			zone: zone.zoneName,
			qrToken,
			createdBy: actor?._id || null
		}).save();

		// 2. SERVICE: bắt buộc đồng kiểm
		let createdOrder = null;
		let createdTasks = [];

		if (ticket.ticketType === SERVICE_TICKET_TYPE) {
			if (!inspectionData) throw new ErrorException(400, "Inspection data is required for SERVICE tickets");

			await inspectionService.createInspection(ticket._id, inspectionData, actor?._id || null);

			// 3. Tạo order + tasks nếu đã chọn dịch vụ
			const ids = normalizeServiceIds(serviceIds);
			if (ids.length > 0) {
				const foundServices = await Service.find({ _id: { $in: ids } })
					.select("serviceName price durationMinutes");

				const serviceMap = new Map(foundServices.map((s) => [String(s._id), s]));
				const missing = ids.filter((id) => !serviceMap.has(id));
				if (missing.length) throw new ErrorException(400, `Một số dịch vụ không hợp lệ: ${missing.join(", ")}`);

				const snapshotServices = ids.map((id) => {
					const s = serviceMap.get(id);
					return {
						serviceId: s._id,
						serviceNameSnapshot: s.serviceName,
						durationMinutesSnapshot: Number(s.durationMinutes || 0),
						quantity: 1,
						price: Number(s.price || 0)
					};
				});

				const totalServiceFee = snapshotServices.reduce((sum, i) => sum + i.price * i.quantity, 0);

				createdOrder = await Order.create({
					ticketId: ticket._id,
					customerPhone: ticket.customerPhone || "N/A",
					services: snapshotServices,
					parkingFee: Number(ticket.parkingFee || 0),
					totalServiceFee,
					includeParkingFee: false,
					totalAmount: totalServiceFee,
					invoiceStatus: "DRAFT",
					isPublicForGuest: false,
					invoiceConfirmedAt: null,
					invoiceConfirmedBy: null,
					paymentStatus: "UNPAID"
				});

				createdTasks = await serviceTaskService.createTasksFromOrder(createdOrder._id, {
					defaultAssignedStaffId: shouldAssignDefaultStaff(actor) ? actor._id : null
				});
			}
		}

		// 4. Trả kết quả
		const result = (await Ticket.findById(ticket._id).populate("inspection")).toObject();
		if (createdOrder) result.serviceOrder = createdOrder;
		if (createdTasks.length) result.serviceTasks = createdTasks;

		res.status(201).json({ message: "Hoàn tất tiếp nhận và đồng kiểm xe", data: result });
	} catch (err) {
		next(err);
	}
});

// POST /:id/services — thêm dịch vụ vào ticket
router.post("/:id/services", authRole("ADMIN", "STAFF"), async (req, res, next) => {
	try {
		const ticket = await Ticket.findById(req.params.id);
		if (!ticket) throw new ErrorException(404, "Ticket not found");
		if (ticket.ticketType !== SERVICE_TICKET_TYPE)
			throw new ErrorException(400, "Only SERVICE ticket supports service flow");
		if (!ticket.inspection)
			throw new ErrorException(400, "Inspection must be completed before selecting services");

		const ids = normalizeServiceIds(req.body.serviceIds);
		if (!ids.length) throw new ErrorException(400, "Service list is required");

		const foundServices = await Service.find({ _id: { $in: ids } })
			.select("serviceName price durationMinutes");

		const serviceMap = new Map(foundServices.map((s) => [String(s._id), s]));
		const missing = ids.filter((id) => !serviceMap.has(id));
		if (missing.length) throw new ErrorException(400, `Một số dịch vụ không hợp lệ: ${missing.join(", ")}`);

		const snapshotServices = ids.map((id) => {
			const s = serviceMap.get(id);
			return {
				serviceId: s._id,
				serviceNameSnapshot: s.serviceName,
				durationMinutesSnapshot: Number(s.durationMinutes || 0),
				quantity: 1,
				price: Number(s.price || 0)
			};
		});

		const totalServiceFee = snapshotServices.reduce((sum, i) => sum + i.price * i.quantity, 0);
		const parkingFee = Number(ticket.parkingFee || 0);

		// Kiểm tra order cũ
		const latestOrder = await Order.findOne({ ticketId: ticket._id }).sort({ createdAt: -1 });
		if (latestOrder?.invoiceStatus === "CONFIRMED")
			throw new ErrorException(409, "Invoice already confirmed. Cannot update service order.");

		const payload = {
			customerPhone: ticket.customerPhone || "N/A",
			services: snapshotServices,
			parkingFee,
			totalServiceFee,
			includeParkingFee: false,
			totalAmount: totalServiceFee,
			invoiceStatus: "DRAFT",
			isPublicForGuest: false,
			invoiceConfirmedAt: null,
			invoiceConfirmedBy: null,
			paymentStatus: "UNPAID"
		};

		const order = latestOrder
			? await Object.assign(latestOrder, payload).save()
			: await Order.create({ ticketId: ticket._id, ...payload });

		const tasks = await serviceTaskService.createTasksFromOrder(order._id, {
			defaultAssignedStaffId: shouldAssignDefaultStaff(req.user) ? req.user._id : null
		});

		res.json({ message: "Đã tạo service order và service tasks", data: { ticketId: ticket._id, order, tasks } });
	} catch (err) {
		next(err);
	}
});

// GET /:id/invoice
router.get("/:id/invoice", authRole("ADMIN", "STAFF"), async (req, res, next) => {
	try {
		const ticket = await Ticket.findById(req.params.id);
		if (!ticket) throw new ErrorException(404, "Ticket not found");

		const order = await Order.findOne({ ticketId: ticket._id })
			.sort({ createdAt: -1 })
			.populate("services.serviceId", "serviceName");

		// PARKING chưa có order → trả invoice tạm
		if (!order && ticket.ticketType === "PARKING") {
			const now = new Date();
			const durationMs = now - new Date(ticket.checkinAt || ticket.createdAt);
			const hours = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60)));

			return res.json({
				data: {
					ticket,
					invoice: {
						services: [],
						totalServiceFee: 0,
						parkingFee: hours * 10000,
						includeParkingFee: true,
						totalAmount: hours * 10000,
						invoiceStatus: "DRAFT",
						paymentStatus: "UNPAID",
						invoiceConfirmedAt: null,
						isPublicForGuest: false
					}
				}
			});
		}

		if (!order) throw new ErrorException(404, "Service order not found for this ticket");

		res.json({ data: { ticket, invoice: order } });
	} catch (err) {
		next(err);
	}
});

// PATCH /:id/invoice-draft
router.patch("/:id/invoice-draft", authRole("ADMIN"), async (req, res, next) => {
	try {
		const order = await Order.findOne({ ticketId: req.params.id }).sort({ createdAt: -1 });
		if (!order) throw new ErrorException(404, "Service order not found for this ticket");
		if (order.invoiceStatus === "CONFIRMED") throw new ErrorException(409, "Invoice already confirmed");

		order.includeParkingFee = Boolean(req.body.includeParkingFee);
		order.totalAmount = order.totalServiceFee + (order.includeParkingFee ? order.parkingFee : 0);
		order.invoiceStatus = "DRAFT";
		order.isPublicForGuest = false;
		order.invoiceConfirmedAt = null;
		order.invoiceConfirmedBy = null;
		await order.save();

		res.json({ message: "Cập nhật invoice draft thành công", data: order });
	} catch (err) {
		next(err);
	}
});

// POST /:id/invoice-confirm
router.post("/:id/invoice-confirm", authRole("ADMIN", "STAFF"), async (req, res, next) => {
	try {
		const ticket = await Ticket.findById(req.params.id);
		if (!ticket) throw new ErrorException(404, "Ticket not found");

		const order = await Order.findOne({ ticketId: ticket._id }).sort({ createdAt: -1 });
		if (!order) throw new ErrorException(404, "Service order not found for this ticket");

		ticket.checkoutAt = new Date();
		await ticket.save();

		const hours = Math.ceil((ticket.checkoutAt - ticket.checkinAt) / (1000 * 60 * 60));
		order.parkingFee = hours * 10000;
		order.invoiceStatus = "CONFIRMED";
		order.isPublicForGuest = true;
		order.invoiceConfirmedAt = new Date();
		order.invoiceConfirmedBy = req.user?._id || null;
		order.totalAmount = order.totalServiceFee + (order.includeParkingFee ? order.parkingFee : 0);
		await order.save();

		res.json({ message: "Xác nhận hóa đơn thành công", data: order });
	} catch (err) {
		next(err);
	}
});

// POST /:id/payment-confirm
router.post("/:id/payment-confirm", authRole("ADMIN", "STAFF"), async (req, res, next) => {
	try {
		const ticket = await Ticket.findById(req.params.id);
		if (!ticket) throw new ErrorException(404, "Ticket not found");

		let order = await Order.findOne({ ticketId: ticket._id }).sort({ createdAt: -1 });

		// PARKING không có order → tự tạo
		if (!order && ticket.ticketType === "PARKING") {
			const checkoutAt = new Date();
			const hours = Math.max(1, Math.ceil((checkoutAt - new Date(ticket.checkinAt || ticket.createdAt)) / (1000 * 60 * 60)));
			const parkingFee = hours * 10000;

			ticket.parkingFee = parkingFee;
			await ticket.save();

			order = await Order.create({
				ticketId: ticket._id,
				customerPhone: ticket.customerPhone || "N/A",
				services: [],
				parkingFee,
				totalServiceFee: 0,
				includeParkingFee: true,
				totalAmount: parkingFee,
				invoiceStatus: "CONFIRMED",
				isPublicForGuest: true,
				invoiceConfirmedAt: new Date(),
				invoiceConfirmedBy: req.user?._id || null,
				paymentStatus: "PAID"
			});
		}

		if (!order) throw new ErrorException(404, "Invoice not found");

		if (order.invoiceStatus !== "CONFIRMED") {
			order.invoiceStatus = "CONFIRMED";
			order.isPublicForGuest = true;
			order.invoiceConfirmedAt = new Date();
			order.invoiceConfirmedBy = req.user?._id || null;
			order.totalAmount = order.totalServiceFee + (order.includeParkingFee ? order.parkingFee : 0);
		}
		order.paymentStatus = "PAID";
		await order.save();

		// Checkout + release zone
		if (!ticket.checkoutAt) {
			ticket.checkoutAt = new Date();
			ticket.status = "COMPLETED";
			await ticket.save();

			const zone = await Zone.findOne({ zoneName: ticket.zone });
			if (zone) {
				zone.occupied = Math.max(0, zone.occupied - 1);
				zone.availableSlots = zone.capacity - zone.occupied;
				zone.status = zone.occupied >= zone.capacity ? "FULL" : "AVAILABLE";
				await zone.save();
			}
		}

		res.json({ message: "Xác nhận thanh toán tiền mặt thành công", data: order });
	} catch (err) {
		next(err);
	}
});

// GET /:id — chi tiết ticket (đặt cuối để không conflict với các route trên)
router.get("/:id", authRole("ADMIN", "STAFF"), async (req, res, next) => {
	try {
		const ticket = await Ticket.findById(req.params.id).populate("inspection");
		if (!ticket) throw new ErrorException(404, "Ticket not found");
		res.json({ data: ticket });
	} catch (err) {
		next(err);
	}
});

module.exports = router;