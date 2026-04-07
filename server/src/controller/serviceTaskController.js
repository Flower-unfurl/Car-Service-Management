const serviceTaskService = require("../service/serviceTaskService");
const socketService = require("../service/socketService");
const ErrorException = require("../util/errorException");

const serviceTaskController = {
    // Get all tasks for a ticket
    getTasksByTicket: async (req, res, next) => {
        try {
            const { ticketId } = req.params;
            const tasks = await serviceTaskService.getTasksByTicketId(ticketId);
            
            res.status(200).json({
                success: true,
                data: tasks
            });
        } catch (error) {
            next(error);
        }
    },

    // Get single task by ID
    getTaskById: async (req, res, next) => {
        try {
            const { id } = req.params;
            const task = await serviceTaskService.getTaskById(id);
            
            res.status(200).json({
                success: true,
                data: task
            });
        } catch (error) {
            next(error);
        }
    },

    // Get tasks assigned to logged-in staff
    getMyTasks: async (req, res, next) => {
        try {
            const staffId = req.user._id;
            const tasks = await serviceTaskService.getTasksByStaffId(staffId);
            
            res.status(200).json({
                success: true,
                data: tasks
            });
        } catch (error) {
            next(error);
        }
    },

    // Create tasks from order
    createTasksFromOrder: async (req, res, next) => {
        try {
            const { orderId } = req.body;
            
            if (!orderId) {
                throw new ErrorException(400, "Order ID is required");
            }

            const tasks = await serviceTaskService.createTasksFromOrder(orderId);
            
            res.status(201).json({
                success: true,
                message: "Service tasks created successfully",
                data: tasks
            });
        } catch (error) {
            next(error);
        }
    },

    // Start a task
    startTask: async (req, res, next) => {
        try {
            const { id } = req.params;
            const staffId = req.user ? req.user._id : null;

            const task = await serviceTaskService.startTask(id, staffId);

            // Send realtime notification
            try {
                socketService.notifyTaskStarted(task.ticketId, task);
                
                // Also update progress
                const progress = await serviceTaskService.getTicketProgress(task.ticketId);
                socketService.notifyProgressUpdate(task.ticketId, progress);
            } catch (socketError) {
                console.error("Socket notification error:", socketError);
            }

            res.status(200).json({
                success: true,
                message: "Task started successfully",
                data: task
            });
        } catch (error) {
            next(error);
        }
    },

    // Complete a task
    completeTask: async (req, res, next) => {
        try {
            const { id } = req.params;
            const staffId = req.user ? req.user._id : null;

            const result = await serviceTaskService.completeTask(id, staffId);

            // Send realtime notifications
            try {
                socketService.notifyTaskCompleted(
                    result.task.ticketId,
                    result.task,
                    result.materialUsageRecords
                );

                // Update progress
                const progress = await serviceTaskService.getTicketProgress(result.task.ticketId);
                socketService.notifyProgressUpdate(result.task.ticketId, progress);

                // Notify about low stock materials
                if (result.lowStockMaterials && result.lowStockMaterials.length > 0) {
                    result.lowStockMaterials.forEach(material => {
                        socketService.notifyLowStock(material);
                    });
                }
            } catch (socketError) {
                console.error("Socket notification error:", socketError);
            }

            res.status(200).json({
                success: true,
                message: "Task completed successfully",
                data: {
                    task: result.task,
                    materialUsageRecords: result.materialUsageRecords,
                    lowStockAlerts: result.lowStockMaterials
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // Assign staff to task
    assignStaff: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { staffId } = req.body;

            if (!staffId) {
                throw new ErrorException(400, "Staff ID is required");
            }

            const task = await serviceTaskService.assignStaff(id, staffId);

            // Notify assigned staff
            try {
                socketService.notifyStaffAssigned(staffId, task);
            } catch (socketError) {
                console.error("Socket notification error:", socketError);
            }

            res.status(200).json({
                success: true,
                message: "Staff assigned successfully",
                data: task
            });
        } catch (error) {
            next(error);
        }
    },

    // Get material usage for a ticket
    getMaterialUsage: async (req, res, next) => {
        try {
            const { ticketId } = req.params;
            const usage = await serviceTaskService.getMaterialUsageByTicketId(ticketId);
            
            res.status(200).json({
                success: true,
                data: usage
            });
        } catch (error) {
            next(error);
        }
    },

    // Get ticket progress
    getTicketProgress: async (req, res, next) => {
        try {
            const { ticketId } = req.params;
            const progress = await serviceTaskService.getTicketProgress(ticketId);
            
            res.status(200).json({
                success: true,
                data: progress
            });
        } catch (error) {
            next(error);
        }
    },

    // Update task (generic)
    updateTask: async (req, res, next) => {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const task = await serviceTaskService.updateTask(id, updateData);

            res.status(200).json({
                success: true,
                message: "Task updated successfully",
                data: task
            });
        } catch (error) {
            next(error);
        }
    },

    // Delete task
    deleteTask: async (req, res, next) => {
        try {
            const { id } = req.params;
            await serviceTaskService.deleteTask(id);

            res.status(200).json({
                success: true,
                message: "Task deleted successfully"
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = serviceTaskController;
