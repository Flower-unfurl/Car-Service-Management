const Ticket = require("../schema/ticketSchema");
const Order = require("../schema/order");
const Service = require("../schema/serviceSchema");
const Zone = require("../schema/zoneSchema");
const crypto = require("crypto");
const zoneService = require("./zoneService");
const inspectionService = require("./inspectionService");
const ErrorException = require("../util/errorException");

const SERVICE_TICKET_TYPE = "SERVICE";
const ALLOWED_TICKET_TYPES = ["PARKING", "SERVICE"];

const normalizeTicketType = (value) => {
    if (typeof value !== "string") {
        return SERVICE_TICKET_TYPE;
    }

    const normalized = value.trim().toUpperCase();
    return ALLOWED_TICKET_TYPES.includes(normalized) ? normalized : null;
};

const normalizeServiceIds = (serviceIds) => {
    const list = Array.isArray(serviceIds) ? serviceIds : [];
    const seen = new Set();
    const normalized = [];

    list.forEach((id) => {
        const value = String(id || "").trim();
        if (!value || seen.has(value)) {
            return;
        }

        seen.add(value);
        normalized.push(value);
    });

    return normalized;
};

const shouldAssignDefaultStaff = (actor) => {
    return Boolean(actor && actor._id && actor.role === "STAFF");
};

const ticketService = {
    getAllTickets: async () => {
        return await Ticket.find().populate("inspection").sort({ createdAt: -1 });
    },

    getTicketByQrToken: async (qrToken) => {
        if (!qrToken) {
            return null;
        }

        return await Ticket.findOne({ qrToken }).populate("inspection");
    },
    
    getTicketById: async (id) => {
        return await Ticket.findById(id).populate("inspection");
    },

    updateTicketStatus: async (ticketId, status) => {
        return await Ticket.findByIdAndUpdate(ticketId, { status }, { new: true });
    },

    createTicket: async (ticketData, actor) => {
        const { zoneId } = ticketData;
        if (!zoneId) {
            throw new ErrorException(400, "Chưa chọn khu vực (Zone)");
        }

        const ticketType = normalizeTicketType(ticketData?.ticketType);
        if (!ticketType) {
            throw new ErrorException(400, "Loại phiếu không hợp lệ. Chỉ chấp nhận PARKING hoặc SERVICE.");
        }
        
        // 1. Kiểm tra và chiếm chỗ trong zone
        const zone = await zoneService.occupyZone(zoneId);
        
        // 2. Tạo qrToken ẩn danh (random string)
        const qrToken = crypto.randomBytes(16).toString("hex");
        
        const newTicket = new Ticket({
            ...ticketData,
            ticketType,
            zone: zone.zoneName, // Lưu tên hiển thị cho ticket
            qrToken,
            createdBy: actor?._id || null
        });

        return await newTicket.save();
    },

    createOrUpdateServiceOrder: async (ticketId, serviceIds) => {
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            throw new ErrorException(404, "Ticket not found");
        }

        if (ticket.ticketType !== SERVICE_TICKET_TYPE) {
            throw new ErrorException(400, "Ticket type must be SERVICE to create service order");
        }

        const normalizedServiceIds = normalizeServiceIds(serviceIds);
        if (!normalizedServiceIds.length) {
            throw new ErrorException(400, "Service list is required");
        }

        const foundServices = await Service.find({ _id: { $in: normalizedServiceIds } }).select(
            "serviceName price durationMinutes"
        );

        const serviceMap = new Map(
            foundServices.map((service) => [String(service._id), service])
        );

        const missingServiceIds = normalizedServiceIds.filter((id) => !serviceMap.has(id));
        if (missingServiceIds.length > 0) {
            throw new ErrorException(400, `Một số dịch vụ không hợp lệ: ${missingServiceIds.join(", ")}`);
        }

        const snapshotServices = normalizedServiceIds.map((id) => {
            const service = serviceMap.get(id);

            return {
                serviceId: service._id,
                serviceNameSnapshot: service.serviceName,
                durationMinutesSnapshot: Number(service.durationMinutes || 0),
                quantity: 1,
                price: Number(service.price || 0)
            };
        });

        const totalServiceFee = snapshotServices.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );
        const parkingFee = Number(ticket.parkingFee || 0);

        const latestOrder = await Order.findOne({ ticketId: ticket._id }).sort({ createdAt: -1 });
        if (latestOrder && latestOrder.invoiceStatus === "CONFIRMED") {
            throw new ErrorException(409, "Invoice already confirmed. Cannot update service order.");
        }

        const basePayload = {
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

        if (latestOrder) {
            Object.assign(latestOrder, basePayload);
            await latestOrder.save();
            return latestOrder;
        }

        return await Order.create({
            ticketId: ticket._id,
            ...basePayload
        });
    },

    getTicketInvoice: async (ticketId) => {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
        throw new ErrorException(404, "Ticket not found");
    }

    let order = await Order.findOne({ ticketId })
        .sort({ createdAt: -1 })
        .populate("services.serviceId", "serviceName");

    // =========================================
    // 🅿️ PARKING: chưa có order vẫn trả invoice tạm
    // =========================================
    if (!order && ticket.ticketType === "PARKING") {
        const now = new Date();
        // const now = new Date("2026-07-05T12:50:00");
        const checkinAt = new Date(ticket.checkinAt || ticket.createdAt);

        const durationMs = now - checkinAt;
        const durationHours = durationMs / (1000 * 60 * 60);
        const hours = Math.max(1, Math.ceil(durationHours));

        const pricePerHour = 10000;
        const parkingFee = hours * pricePerHour;

        return {
            ticket,
            invoice: {
                services: [],
                totalServiceFee: 0,
                parkingFee,
                includeParkingFee: true,
                totalAmount: parkingFee,
                invoiceStatus: "DRAFT",
                paymentStatus: "UNPAID",
                invoiceConfirmedAt: null,
                isPublicForGuest: false
            }
        };
    }

    // =========================================
    // ❌ SERVICE bắt buộc phải có order
    // =========================================
    if (!order) {
        throw new ErrorException(
            404,
            "Service order not found for this ticket"
        );
    }

    return {
        ticket,
        invoice: order
    };
},

    confirmInvoice: async (ticketId, actorId, includeParkingFee) => {
        const order = await Order.findOne({ ticketId }).sort({ createdAt: -1 });
        if (!order) {
            throw new ErrorException(404, "Service order not found for this ticket");
        }
        const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
        throw new ErrorException(404, "Ticket not found");
    }
        // const checkoutAt = new Date("2026-07-05T12:50:00");

        ticket.checkoutAt = new Date();
        ticket.save();

        // thời gian gửi (giờ)
        const durationMs = ticket.checkoutAt - ticket.checkinAt;
        const durationHours = durationMs / (1000 * 60 * 60);

        // làm tròn lên (ví dụ: 1.2h → 2h)
        const hours = Math.ceil(durationHours);

        // giá tiền mỗi giờ
        const pricePerHour = 10000;


        // tính tiền
        order.parkingFee = hours * pricePerHour;
        if (includeParkingFee !== undefined) {
            order.includeParkingFee = Boolean(includeParkingFee);
        }

        order.invoiceStatus = "CONFIRMED";
        order.isPublicForGuest = true;
        order.invoiceConfirmedAt = new Date();
        order.invoiceConfirmedBy = actorId || null;
        order.totalAmount = order.totalServiceFee + (order.includeParkingFee ? order.parkingFee : 0);

        await order.save();
        return order;
    },

    async confirmInvoicePayment(ticketId, actorId, includeParkingFee) {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
        throw new ErrorException(404, "Ticket not found");
    }

    let order = await Order.findOne({ ticketId }).sort({ createdAt: -1 });

    // ==============================
    // 🚗 AUTO CREATE ORDER FOR PARKING
    // ==============================
    if (!order && ticket.ticketType === "PARKING") {
        // const checkoutAt = new Date("2026-07-05T12:50:00");
        const checkoutAt = new Date();
        const checkinAt = new Date(ticket.checkinAt || ticket.createdAt);

        const durationMs = checkoutAt - checkinAt;
        const durationHours = durationMs / (1000 * 60 * 60);
        const hours = Math.max(1, Math.ceil(durationHours));

        const pricePerHour = 10000;
        const parkingFee = hours * pricePerHour;
        ticket.parkingFee = parkingFee;
        ticket.save();

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
            invoiceConfirmedBy: actorId || null,
            paymentStatus: "PAID"
        });
    }

    // ==============================
    // ❌ STILL NOT FOUND
    // ==============================
    if (!order) {
        throw new ErrorException(404, "Invoice not found");
    }

    // ==============================
    // 💵 UPDATE EXISTING ORDER
    // ==============================
    if (order.invoiceStatus !== "CONFIRMED") {
        if (includeParkingFee !== undefined) {
            order.includeParkingFee = Boolean(includeParkingFee);
        }
        order.invoiceStatus = "CONFIRMED";
        order.isPublicForGuest = true;
        order.invoiceConfirmedAt = new Date();
        order.invoiceConfirmedBy = actorId || null;
        order.totalAmount =
            order.totalServiceFee +
            (order.includeParkingFee ? order.parkingFee : 0);
    }

    order.paymentStatus = "PAID";
    await order.save();

    // ==============================
    // 🚪 CHECKOUT + RELEASE ZONE
    // ==============================
    if (!ticket.checkoutAt) {
        ticket.checkoutAt = new Date();
        // ticket.checkoutAt = new Date("2026-07-05T12:50:00");
        ticket.status = "COMPLETED";
        await ticket.save();

        const zone = await Zone.findOne({ zoneName: ticket.zone });

        if (zone) {
            zone.occupied = Math.max(0, zone.occupied - 1);
            zone.availableSlots = zone.capacity - zone.occupied;

            if (zone.occupied >= zone.capacity) {
                zone.status = "FULL";
            } else {
                zone.status = "AVAILABLE";
            }

            await zone.save();
        }
    }

    return order;
},

    getPublicInvoiceByQrToken: async (qrToken) => {
        const ticket = await ticketService.getTicketByQrToken(qrToken);
        if (!ticket) {
            throw new ErrorException(404, "Ticket not found");
        }

        const invoice = await Order.findOne({
            ticketId: ticket._id,
            invoiceStatus: "CONFIRMED",
            isPublicForGuest: true
        })
            .sort({ createdAt: -1 })
            .populate("services.serviceId", "serviceName");

        if (!invoice) {
            throw new ErrorException(404, "Invoice is not published yet");
        }

        return {
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
        };
    },

    createFullEntry: async (fullData, actor) => {
        const { ticketData = {}, inspectionData, serviceIds = [] } = fullData;

        // 1. Tạo ticket (có occupy zone)
        const ticket = await ticketService.createTicket(ticketData, actor);

        let createdTasks = [];
        let createdOrder = null;

        // 2. Nếu là phiếu dịch vụ thì bắt buộc tạo đồng kiểm ngay
        if (ticket.ticketType === SERVICE_TICKET_TYPE) {
            if (!inspectionData) {
                throw new ErrorException(400, "Inspection data is required for SERVICE tickets");
            }

            await inspectionService.createInspection(ticket._id, inspectionData, actor?._id || null);

            // 3. Nếu staff đã chọn dịch vụ, tạo service order snapshot + auto task luôn
            const normalizedServiceIds = normalizeServiceIds(serviceIds);
            if (normalizedServiceIds.length > 0) {
                createdOrder = await ticketService.createOrUpdateServiceOrder(ticket._id, normalizedServiceIds);

                // Lazy require to avoid circular dependency at module load time.
                const serviceTaskService = require("./serviceTaskService");
                createdTasks = await serviceTaskService.createTasksFromOrder(createdOrder._id, {
                    defaultAssignedStaffId: shouldAssignDefaultStaff(actor) ? actor._id : null
                });
            }
        }

        // 4. Trả về ticket đã populate inspection và kèm order/task (nếu có)
        const resultTicket = await Ticket.findById(ticket._id).populate("inspection");
        const result = resultTicket.toObject();

        if (createdOrder) {
            result.serviceOrder = createdOrder;
        }

        if (createdTasks.length > 0) {
            result.serviceTasks = createdTasks;
        }

        return result;
    },

    addServicesToTicketFlow: async (ticketId, serviceIds, actor) => {
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            throw new ErrorException(404, "Ticket not found");
        }

        if (ticket.ticketType !== SERVICE_TICKET_TYPE) {
            throw new ErrorException(400, "Only SERVICE ticket supports service flow");
        }

        if (!ticket.inspection) {
            throw new ErrorException(400, "Inspection must be completed before selecting services");
        }

        const order = await ticketService.createOrUpdateServiceOrder(ticket._id, serviceIds);

        // Lazy require to avoid circular dependency at module load time.
        const serviceTaskService = require("./serviceTaskService");
        const tasks = await serviceTaskService.createTasksFromOrder(order._id, {
            defaultAssignedStaffId: shouldAssignDefaultStaff(actor) ? actor._id : null
        });

        return {
            ticketId: ticket._id,
            order,
            tasks
        };
    }
};

module.exports = ticketService;
