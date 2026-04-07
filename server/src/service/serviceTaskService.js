const ServiceTask = require("../schema/serviceTasks");
const Order = require("../schema/order");
const MaterialUsage = require("../schema/materialUsages");
const User = require("../schema/userSchema");
const materialService = require("./materialService");
const ticketService = require("./ticketService");
const ErrorException = require("../util/errorException");

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

    if (!task.assignedStaffId || String(task.assignedStaffId) !== String(actor._id)) {
        throw new ErrorException(403, "Staff can only operate tasks assigned to themselves");
    }
};

const serviceTaskService = {
    // Get all tasks for a ticket
    getTasksByTicketId: async (ticketId) => {
        return await ServiceTask.find({ ticketId })
            .populate("serviceId", "serviceName description durationMinutes materials")
            .populate("assignedStaffId", "name email phone")
            .sort({ stepOrder: 1 });
    },

    // Get single task by ID
    getTaskById: async (taskId) => {
        const task = await ServiceTask.findById(taskId)
            .populate("serviceId", "serviceName description durationMinutes materials")
            .populate("assignedStaffId", "name email phone");
        
        if (!task) {
            throw new ErrorException(404, "Service task not found");
        }
        
        return task;
    },

    // Get tasks assigned to a specific staff member
    getTasksByStaffId: async (staffId) => {
        return await ServiceTask.find({ assignedStaffId: staffId })
            .populate("ticketId", "licensePlate customerName customerPhone status")
            .populate("serviceId", "serviceName description")
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
                assignedStaffId: user._id
            })
                .populate("serviceId", "serviceName description durationMinutes materials")
                .populate("assignedStaffId", "name email phone")
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
            if (task.assignedStaffId && String(task.assignedStaffId._id || task.assignedStaffId) === String(user._id)) {
                return task;
            }
            throw new ErrorException(403, "Access denied");
        }

        throw new ErrorException(403, "Access denied");
    },

    // Create tasks automatically when Order is created
    createTasksFromOrder: async (orderId) => {
        const order = await Order.findById(orderId)
            .populate("services.serviceId");

        if (!order) {
            throw new ErrorException(404, "Order not found");
        }

        if (!order.services || order.services.length === 0) {
            throw new ErrorException(400, "Order has no services");
        }

        const tasks = [];
        let stepOrder = 1;

        // Create tasks in order
        for (const orderService of order.services) {
            const service = orderService.serviceId;
            
            // Create task for this service
            const newTask = new ServiceTask({
                ticketId: order.ticketId,
                serviceId: service._id,
                stepOrder: stepOrder,
                status: "PENDING"
            });

            const savedTask = await newTask.save();
            tasks.push(savedTask);
            stepOrder++;
        }

        return tasks;
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
            .populate("assignedStaffId", "name email");
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

        if (task.serviceId.materials && task.serviceId.materials.length > 0) {
            for (const materialReq of task.serviceId.materials) {
                try {
                    const material = await materialService.getMaterialById(materialReq.materialId);

                    if (material.stockQuantity < materialReq.quantity) {
                        materialWarnings.push({
                            materialId: materialReq.materialId,
                            materialName: material.materialName,
                            requiredQuantity: materialReq.quantity,
                            availableQuantity: material.stockQuantity,
                            message: `Thiếu vật tư "${material.materialName}": cần ${materialReq.quantity}, còn ${material.stockQuantity}. Task vẫn được đánh dấu COMPLETED.`
                        });
                        continue;
                    }

                    // Deduct stock
                    const deductionResult = await materialService.deductStock(
                        materialReq.materialId,
                        materialReq.quantity
                    );

                    // Create material usage record
                    const materialUsage = new MaterialUsage({
                        taskId: task._id,
                        materialId: materialReq.materialId,
                        quantityUsed: materialReq.quantity,
                        date: new Date(),
                        performedBy: actor?._id || task.assignedStaffId
                    });

                    await materialUsage.save();
                    materialUsageRecords.push(materialUsage);

                    // Track low stock materials
                    if (deductionResult.isLowStock) {
                        lowStockMaterials.push({
                            materialId: materialReq.materialId,
                            materialName: deductionResult.material.materialName,
                            remainingStock: deductionResult.remainingStock,
                            minAlertLevel: deductionResult.material.minAlertLevel
                        });
                    }
                } catch (error) {
                    materialWarnings.push({
                        materialId: materialReq.materialId,
                        message: `Không thể trừ vật tư ${materialReq.materialId}: ${error.message}. Task vẫn được đánh dấu COMPLETED.`
                    });
                }
            }
        }

        const populatedTask = await ServiceTask.findById(taskId)
            .populate("serviceId", "serviceName description materials")
            .populate("assignedStaffId", "name email");

        return {
            task: populatedTask,
            materialUsageRecords,
            lowStockMaterials,
            materialWarnings
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
        await task.save();

        return await ServiceTask.findById(taskId)
            .populate("serviceId", "serviceName description")
            .populate("assignedStaffId", "name email phone");
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
                assignedStaffId: user._id
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
                assignedStaffId: user._id
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
        ).populate("serviceId assignedStaffId");

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
