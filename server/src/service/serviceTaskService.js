const ServiceTask = require("../schema/serviceTasks");
const Order = require("../schema/order");
const MaterialUsage = require("../schema/materialUsages");
const User = require("../schema/userSchema");
const materialService = require("./materialService");
const ticketService = require("./ticketService");
const ErrorException = require("../util/errorException");

const matchesUserId = (value, targetId) => {
    if (!value || !targetId) {
        return false;
    }

    return String(value._id || value) === String(targetId);
};

const isStaffAssignedToTask = (task, staffId) => {
    if (!task || !staffId) {
        return false;
    }

    if (matchesUserId(task.assignedStaffId, staffId)) {
        return true;
    }

    return Array.isArray(task.supportStaffIds)
        ? task.supportStaffIds.some((supportId) => matchesUserId(supportId, staffId))
        : false;
};

const buildStaffTaskQuery = (staffId) => ({
    $or: [
        { assignedStaffId: staffId },
        { supportStaffIds: staffId }
    ]
});

const withTaskDetails = (query) => {
    return query
        .populate("serviceId", "serviceName description durationMinutes materials")
        .populate("assignedStaffId", "name email phone")
        .populate("supportStaffIds", "name email phone");
};

const buildProgressFromTasks = (tasks = []) => {
    if (!tasks.length) {
        return {
            totalTasks: 0,
            completed: 0,
            inProgress: 0,
            pending: 0,
            progressPercentage: 0
        };
    }

    const completed = tasks.filter((t) => t.status === "COMPLETED").length;
    const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
    const pending = tasks.filter((t) => t.status === "PENDING").length;
    const progressPercentage = Math.round((completed / tasks.length) * 100);

    return {
        totalTasks: tasks.length,
        completed,
        inProgress,
        pending,
        progressPercentage
    };
};

const assertAllowedTaskOperator = (actor) => {
    if (!actor || !actor._id) {
        throw new ErrorException(401, "Unauthorized");
    }

    if (actor.role !== "ADMIN" && actor.role !== "STAFF") {
        throw new ErrorException(403, "Only ADMIN or STAFF can operate tasks");
    }
};

const assertTaskOwnershipForStaff = (task, actor) => {
    if (actor.role !== "STAFF") {
        return;
    }

    if (!isStaffAssignedToTask(task, actor._id)) {
        throw new ErrorException(403, "Staff can only operate tasks assigned to themselves (primary/support)");
    }
};

const serviceTaskService = {
    // Get all tasks for a ticket
    getTasksByTicketId: async (ticketId) => {
        return await withTaskDetails(ServiceTask.find({ ticketId })).sort({ stepOrder: 1 });
    },

    // Get single task by ID
    getTaskById: async (taskId) => {
        const task = await withTaskDetails(ServiceTask.findById(taskId));
        
        if (!task) {
            throw new ErrorException(404, "Service task not found");
        }
        
        return task;
    },

    // Get tasks assigned to a specific staff member
    getTasksByStaffId: async (staffId) => {
        return await ServiceTask.find(buildStaffTaskQuery(staffId))
            .populate("ticketId", "licensePlate customerName customerPhone status")
            .populate("serviceId", "serviceName description durationMinutes materials")
            .populate("assignedStaffId", "name email phone")
            .populate("supportStaffIds", "name email phone")
            .sort({ stepOrder: 1 });
    },

    getTasksByTicketForUser: async (ticketId, user) => {
        if (!user || !user.role) {
            throw new ErrorException(401, "Unauthorized");
        }

        if (user.role === "ADMIN") {
            return await serviceTaskService.getTasksByTicketId(ticketId);
        }

        if (user.role === "STAFF") {
            return await ServiceTask.find({
                ticketId,
                ...buildStaffTaskQuery(user._id)
            })
                .populate("serviceId", "serviceName description durationMinutes materials")
                .populate("assignedStaffId", "name email phone")
                .populate("supportStaffIds", "name email phone")
                .sort({ stepOrder: 1 });
        }

        throw new ErrorException(403, "Access denied");
    },

    getTasksByQrToken: async (qrToken) => {
        const ticket = await ticketService.getTicketByQrToken(qrToken);
        if (!ticket) {
            throw new ErrorException(404, "Ticket not found");
        }

        return await serviceTaskService.getTasksByTicketId(ticket._id);
    },

    getTaskByIdForUser: async (taskId, user) => {
        const task = await serviceTaskService.getTaskById(taskId);

        if (!user || !user.role) {
            throw new ErrorException(401, "Unauthorized");
        }

        if (user.role === "ADMIN") {
            return task;
        }

        if (user.role === "STAFF") {
            if (isStaffAssignedToTask(task, user._id)) {
                return task;
            }
            throw new ErrorException(403, "Access denied");
        }

        throw new ErrorException(403, "Access denied");
    },

    // Create tasks automatically when Order is created
    createTasksFromOrder: async (orderId, { defaultAssignedStaffId = null } = {}) => {
        const order = await Order.findById(orderId)
            .populate("services.serviceId");

        if (!order) {
            throw new ErrorException(404, "Order not found");
        }

        if (!order.services || order.services.length === 0) {
            throw new ErrorException(400, "Order has no services");
        }

        const existingTasksCount = await ServiceTask.countDocuments({ ticketId: order.ticketId });
        if (existingTasksCount > 0) {
            throw new ErrorException(409, "Service tasks already generated for this ticket");
        }

        const tasks = [];
        let stepOrder = 1;

        // Create tasks in order
        for (const orderService of order.services) {
            const service = orderService.serviceId;
            if (!service?._id) {
                continue;
            }
            
            // Create task for this service
            const newTask = new ServiceTask({
                ticketId: order.ticketId,
                serviceId: service._id,
                stepOrder: stepOrder,
                status: "PENDING",
                assignedStaffId: defaultAssignedStaffId || null
            });

            const savedTask = await newTask.save();
            tasks.push(savedTask);
            stepOrder++;
        }

        if (!tasks.length) {
            throw new ErrorException(400, "Order has no valid services to create tasks");
        }

        await ticketService.updateTicketStatus(order.ticketId, "IN_SERVICE");

        return await withTaskDetails(ServiceTask.find({ _id: { $in: tasks.map((task) => task._id) } })).sort({ stepOrder: 1 });
    },

    // Validate if task can be started (check sequential order)
    canStartTask: async (taskId) => {
        const task = await ServiceTask.findById(taskId);
        
        if (!task) {
            throw new ErrorException(404, "Task not found");
        }

        // If it's the first task, can always start
        if (task.stepOrder === 1) {
            return { canStart: true, reason: null };
        }

        // Check if previous task is completed
        const previousTask = await ServiceTask.findOne({
            ticketId: task.ticketId,
            stepOrder: task.stepOrder - 1
        });

        if (!previousTask) {
            throw new ErrorException(500, "Previous task not found");
        }

        if (previousTask.status !== "COMPLETED") {
            return {
                canStart: false,
                reason: `Cannot start this task. Previous task (Step ${previousTask.stepOrder}) must be completed first.`,
                previousTask: {
                    id: previousTask._id,
                    stepOrder: previousTask.stepOrder,
                    status: previousTask.status
                }
            };
        }

        return { canStart: true, reason: null };
    },

    // Start a task
    startTask: async (taskId, actor) => {
        assertAllowedTaskOperator(actor);

        const validation = await serviceTaskService.canStartTask(taskId);
        
        if (!validation.canStart) {
            throw new ErrorException(403, validation.reason);
        }

        const task = await ServiceTask.findById(taskId);

        if (!task) {
            throw new ErrorException(404, "Task not found");
        }

        assertTaskOwnershipForStaff(task, actor);

        if (task.status === "IN_PROGRESS") {
            throw new ErrorException(400, "Task is already in progress");
        }

        if (task.status === "COMPLETED") {
            throw new ErrorException(400, "Task is already completed");
        }

        task.status = "IN_PROGRESS";
        task.startTime = new Date();

        await task.save();

        return await ServiceTask.findById(taskId)
            .populate("serviceId", "serviceName description materials")
            .populate("assignedStaffId", "name email")
            .populate("supportStaffIds", "name email");
    },

    // Complete a task (with automatic material deduction)
    completeTask: async (taskId, actor) => {
        assertAllowedTaskOperator(actor);

        const task = await ServiceTask.findById(taskId)
            .populate("serviceId");

        if (!task) {
            throw new ErrorException(404, "Task not found");
        }

        assertTaskOwnershipForStaff(task, actor);

        if (task.status === "COMPLETED") {
            throw new ErrorException(400, "Task is already completed");
        }

        if (task.status === "PENDING") {
            throw new ErrorException(400, "Task must be started before it can be completed");
        }

        // Mark task as completed
        task.status = "COMPLETED";
        task.endTime = new Date();

        await task.save();

        // Auto-deduct materials if service has materials
        const materialUsageRecords = [];
        const lowStockMaterials = [];
        const materialWarnings = [];

        // Support both `materials` and `materialUsages` defined on a service
        const serviceMaterials = (task.serviceId && Array.isArray(task.serviceId.materials) && task.serviceId.materials.length)
            ? task.serviceId.materials
            : (task.serviceId && Array.isArray(task.serviceId.materialUsages) ? task.serviceId.materialUsages : []);

        if (serviceMaterials && serviceMaterials.length > 0) {
            for (const materialReq of serviceMaterials) {
                try {
                    const rawQty = materialReq && materialReq.quantity;
                    const qty = Number(rawQty);

                    if (!Number.isFinite(qty) || qty <= 0) {
                        materialWarnings.push({
                            materialId: materialReq.materialId,
                            message: `Số lượng không hợp lệ cho vật tư ${materialReq.materialId}: ${rawQty}. Bỏ qua.`
                        });
                        continue;
                    }

                    const material = await materialService.getMaterialById(materialReq.materialId);

                    if (material.stockQuantity < qty) {
                        materialWarnings.push({
                            materialId: materialReq.materialId,
                            materialName: material.materialName,
                            requiredQuantity: qty,
                            availableQuantity: material.stockQuantity,
                            message: `Thiếu vật tư "${material.materialName}": cần ${qty}, còn ${material.stockQuantity}. Task vẫn được đánh dấu COMPLETED.`
                        });
                        continue;
                    }

                    // Deduct stock (ensures save inside service)
                    const deductionResult = await materialService.deductStock(
                        materialReq.materialId,
                        qty
                    );

                    // Create material usage record (persist the actual quantity used)
                    const materialUsage = new MaterialUsage({
                        taskId: task._id,
                        materialId: materialReq.materialId,
                        quantityUsed: qty,
                        date: new Date(),
                        performedBy: (actor && actor._id) ? actor._id : task.assignedStaffId
                    });

                    await materialUsage.save();
                    materialUsageRecords.push(materialUsage);

                    // Track low stock materials
                    if (deductionResult && deductionResult.isLowStock) {
                        lowStockMaterials.push({
                            materialId: materialReq.materialId,
                            materialName: deductionResult.material.materialName,
                            remainingStock: deductionResult.remainingStock,
                            minAlertLevel: deductionResult.material.minAlertLevel
                        });
                    }
                } catch (error) {
                    materialWarnings.push({
                        materialId: materialReq && materialReq.materialId,
                        message: `Không thể trừ vật tư ${materialReq && materialReq.materialId}: ${error.message}. Task vẫn được đánh dấu COMPLETED.`
                    });
                }
            }
        }

        const populatedTask = await ServiceTask.findById(taskId)
            .populate("serviceId", "serviceName description materials")
            .populate("assignedStaffId", "name email")
            .populate("supportStaffIds", "name email");

        const ticketTasks = await ServiceTask.find({ ticketId: task.ticketId }).select("status");
        const ticketReadyForPickup = ticketTasks.length > 0 && ticketTasks.every((row) => row.status === "COMPLETED");

        if (ticketReadyForPickup) {
            await ticketService.updateTicketStatus(task.ticketId, "READY_FOR_PICKUP");
        }

        return {
            task: populatedTask,
            materialUsageRecords,
            lowStockMaterials,
            materialWarnings,
            ticketReadyForPickup
        };
    },

    // Assign staff to a task
    assignStaff: async (taskId, staffId) => {
        const task = await ServiceTask.findById(taskId);
        
        if (!task) {
            throw new ErrorException(404, "Task not found");
        }

        if (task.status === "COMPLETED") {
            throw new ErrorException(400, "Cannot assign staff to completed task");
        }

        const staff = await User.findById(staffId);
        if (!staff || staff.role !== "STAFF") {
            throw new ErrorException(400, "Assigned user must be a STAFF account");
        }

        task.assignedStaffId = staffId;
        task.supportStaffIds = (task.supportStaffIds || []).filter(
            (supportId) => String(supportId) !== String(staffId)
        );
        await task.save();

        return await ServiceTask.findById(taskId)
            .populate("serviceId", "serviceName description")
            .populate("assignedStaffId", "name email phone")
            .populate("supportStaffIds", "name email phone");
    },

    // Add support staff to a task (Admin or involved Staff)
    addSupportStaff: async (taskId, supportStaffId, actor) => {
        assertAllowedTaskOperator(actor);

        const task = await ServiceTask.findById(taskId);
        if (!task) {
            throw new ErrorException(404, "Task not found");
        }

        if (task.status === "COMPLETED") {
            throw new ErrorException(400, "Cannot add support staff to completed task");
        }

        if (actor.role === "STAFF" && !isStaffAssignedToTask(task, actor._id)) {
            throw new ErrorException(403, "Staff can only add support staff to their own tasks");
        }

        const supportStaff = await User.findById(supportStaffId);
        if (!supportStaff || supportStaff.role !== "STAFF") {
            throw new ErrorException(400, "Support user must be a STAFF account");
        }

        if (matchesUserId(task.assignedStaffId, supportStaffId)) {
            throw new ErrorException(400, "Support staff is already the primary assignee");
        }

        if (isStaffAssignedToTask(task, supportStaffId)) {
            return await ServiceTask.findById(taskId)
                .populate("serviceId", "serviceName description")
                .populate("assignedStaffId", "name email phone")
                .populate("supportStaffIds", "name email phone");
        }

        task.supportStaffIds = [...(task.supportStaffIds || []), supportStaffId];
        await task.save();

        return await ServiceTask.findById(taskId)
            .populate("serviceId", "serviceName description")
            .populate("assignedStaffId", "name email phone")
            .populate("supportStaffIds", "name email phone");
    },

    // Recommend staff for a task: specialty first, then availability, then workload
    getRecommendedStaffForTask: async (taskId) => {
        const task = await ServiceTask.findById(taskId).populate("serviceId", "serviceName specialty");

        if (!task) {
            throw new ErrorException(404, "Task not found");
        }

        const requiredSpecialty = task.serviceId?.specialty || null;
        const allStaff = await User.find({ role: "STAFF" }).select("name email phone specialty isAvailable");

        if (allStaff.length === 0) {
            return {
                requiredSpecialty,
                recommendedStaff: [],
                alternativeStaff: []
            };
        }

        const staffIds = allStaff.map((s) => s._id);
        const workloadRows = await ServiceTask.aggregate([
            {
                $match: {
                    status: "IN_PROGRESS",
                    assignedStaffId: { $in: staffIds }
                }
            },
            {
                $group: {
                    _id: "$assignedStaffId",
                    activeTasks: { $sum: 1 }
                }
            }
        ]);

        const workloadMap = new Map(
            workloadRows.map((row) => [String(row._id), row.activeTasks])
        );

        const ranked = allStaff
            .map((staff) => {
                const workload = workloadMap.get(String(staff._id)) || 0;
                const specialtyMatch = requiredSpecialty && staff.specialty === requiredSpecialty;
                const available = Boolean(staff.isAvailable) && workload === 0;

                let score = 0;
                if (specialtyMatch) score += 100;
                if (available) score += 50;
                score -= workload * 10;

                return {
                    _id: staff._id,
                    name: staff.name,
                    email: staff.email,
                    phone: staff.phone,
                    specialty: staff.specialty,
                    isAvailable: available,
                    activeTasks: workload,
                    specialtyMatch: Boolean(specialtyMatch),
                    score
                };
            })
            .sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                if (a.activeTasks !== b.activeTasks) return a.activeTasks - b.activeTasks;
                return (a.name || "").localeCompare(b.name || "");
            });

        return {
            requiredSpecialty,
            recommendedStaff: ranked.filter((s) => s.specialtyMatch && s.isAvailable),
            alternativeStaff: ranked.filter((s) => !(s.specialtyMatch && s.isAvailable))
        };
    },

    // Get material usage history for a ticket
    getMaterialUsageByTicketId: async (ticketId) => {
        const tasks = await ServiceTask.find({ ticketId });
        const taskIds = tasks.map(t => t._id);

        return await MaterialUsage.find({ taskId: { $in: taskIds } })
            .populate("materialId", "materialName unit")
            .populate("performedBy", "name email")
            .sort({ date: -1 });
    },

    getMaterialUsageByTicketForUser: async (ticketId, user) => {
        if (!user || !user.role) {
            throw new ErrorException(401, "Unauthorized");
        }

        if (user.role === "ADMIN") {
            return await serviceTaskService.getMaterialUsageByTicketId(ticketId);
        }

        if (user.role === "STAFF") {
            const tasks = await ServiceTask.find({
                ticketId,
                ...buildStaffTaskQuery(user._id)
            });
            const taskIds = tasks.map((task) => task._id);

            if (!taskIds.length) {
                return [];
            }

            return await MaterialUsage.find({ taskId: { $in: taskIds } })
                .populate("materialId", "materialName unit")
                .populate("performedBy", "name email")
                .sort({ date: -1 });
        }

        throw new ErrorException(403, "Access denied");
    },

    getMaterialUsageByQrToken: async (qrToken) => {
        const ticket = await ticketService.getTicketByQrToken(qrToken);
        if (!ticket) {
            throw new ErrorException(404, "Ticket not found");
        }

        return await serviceTaskService.getMaterialUsageByTicketId(ticket._id);
    },

    // Get progress statistics for a ticket
    getTicketProgress: async (ticketId) => {
        const tasks = await ServiceTask.find({ ticketId });

        return buildProgressFromTasks(tasks);
    },

    getTicketProgressForUser: async (ticketId, user) => {
        if (!user || !user.role) {
            throw new ErrorException(401, "Unauthorized");
        }

        if (user.role === "ADMIN") {
            return await serviceTaskService.getTicketProgress(ticketId);
        }

        if (user.role === "STAFF") {
            const tasks = await ServiceTask.find({
                ticketId,
                ...buildStaffTaskQuery(user._id)
            });
            return buildProgressFromTasks(tasks);
        }

        throw new ErrorException(403, "Access denied");
    },

    getTicketProgressByQrToken: async (qrToken) => {
        const ticket = await ticketService.getTicketByQrToken(qrToken);
        if (!ticket) {
            throw new ErrorException(404, "Ticket not found");
        }

        return await serviceTaskService.getTicketProgress(ticket._id);
    },

    // Update task (generic update)
    updateTask: async (taskId, updateData) => {
        const task = await ServiceTask.findByIdAndUpdate(
            taskId,
            updateData,
            { new: true, runValidators: true }
        )
            .populate("serviceId assignedStaffId supportStaffIds");

        if (!task) {
            throw new ErrorException(404, "Task not found");
        }

        return task;
    },

    // Delete task
    deleteTask: async (taskId) => {
        const task = await ServiceTask.findByIdAndDelete(taskId);
        
        if (!task) {
            throw new ErrorException(404, "Task not found");
        }

        return task;
    }
};

module.exports = serviceTaskService;
