const express = require("express");
const serviceTaskService = require("../service/serviceTaskService");
const socketService = require("../service/socketService");
const { authToken, authRole } = require("../middleware/authMiddleware");

const serviceTaskRoute = express.Router();

// ==================== PUBLIC/GUEST ROUTES ====================

// Get all tasks by qrToken (Guest tracking)
serviceTaskRoute.get("/guest/:qrToken/tasks", async (req, res) => {
    try {
        const { qrToken } = req.params;
        const tasks = await serviceTaskService.getTasksByQrToken(qrToken);
        
        res.status(200).json({
            success: true,
            data: tasks
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
});

// Get ticket progress by qrToken (Guest tracking)
serviceTaskRoute.get("/guest/:qrToken/progress", async (req, res) => {
    try {
        const { qrToken } = req.params;
        const progress = await serviceTaskService.getTicketProgressByQrToken(qrToken);
        
        res.status(200).json({
            success: true,
            data: progress
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
});

// Get material usage for a ticket by qrToken (Guest tracking)
serviceTaskRoute.get("/guest/:qrToken/material-usage", async (req, res) => {
    try {
        const { qrToken } = req.params;
        const usage = await serviceTaskService.getMaterialUsageByQrToken(qrToken);
        
        res.status(200).json({
            success: true,
            data: usage
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
});

// ==================== AUTHENTICATED ROUTES ====================

// Get all tasks for a specific ticket (Admin = full ticket, Staff = assigned tasks only)
serviceTaskRoute.get("/ticket/:ticketId", authToken, authRole("ADMIN", "STAFF"), async (req, res) => {
    try {
        const { ticketId } = req.params;
        const tasks = await serviceTaskService.getTasksByTicketForUser(ticketId, req.user);
        
        res.status(200).json({
            success: true,
            data: tasks
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
});

// Get ticket progress for authenticated user (Admin = full ticket, Staff = assigned tasks only)
serviceTaskRoute.get("/ticket/:ticketId/progress", authToken, authRole("ADMIN", "STAFF"), async (req, res) => {
    try {
        const { ticketId } = req.params;
        const progress = await serviceTaskService.getTicketProgressForUser(ticketId, req.user);
        
        res.status(200).json({
            success: true,
            data: progress
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
});

// Get material usage for authenticated user (Admin = full ticket, Staff = assigned tasks only)
serviceTaskRoute.get("/ticket/:ticketId/material-usage", authToken, authRole("ADMIN", "STAFF"), async (req, res) => {
    try {
        const { ticketId } = req.params;
        const usage = await serviceTaskService.getMaterialUsageByTicketForUser(ticketId, req.user);
        
        res.status(200).json({
            success: true,
            data: usage
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
});

// Get tasks assigned to logged-in staff (Staff only)
serviceTaskRoute.get("/my-tasks", authToken, authRole("STAFF"), async (req, res) => {
    try {
        const staffId = req.user._id;
        const tasks = await serviceTaskService.getTasksByStaffId(staffId);
        
        res.status(200).json({
            success: true,
            data: tasks
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
});

// Get recommended staff for a task (Admin only)
serviceTaskRoute.get("/:id/recommend-staff", authToken, authRole("ADMIN"), async (req, res) => {
    try {
        const { id } = req.params;
        const recommendations = await serviceTaskService.getRecommendedStaffForTask(id);

        res.status(200).json({
            success: true,
            data: recommendations
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
});

// Get single task by ID (Admin or assigned Staff)
serviceTaskRoute.get("/:id", authToken, authRole("ADMIN", "STAFF"), async (req, res) => {
    try {
        const { id } = req.params;
        const task = await serviceTaskService.getTaskByIdForUser(id, req.user);
        
        res.status(200).json({
            success: true,
            data: task
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
});

// Start a task (Admin or assigned Staff)
serviceTaskRoute.post("/:id/start", authToken, authRole("ADMIN", "STAFF"), async (req, res) => {
    try {
        const { id } = req.params;
        const task = await serviceTaskService.startTask(id, req.user);

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
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
});

// Complete a task (Admin or assigned Staff)
serviceTaskRoute.post("/:id/complete", authToken, authRole("ADMIN", "STAFF"), async (req, res) => {
    try {
        const { id } = req.params;
        const result = await serviceTaskService.completeTask(id, req.user);

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

            if (result.materialWarnings && result.materialWarnings.length > 0) {
                result.materialWarnings.forEach((warning) => {
                    socketService.emitToAdmins("material:low-stock", {
                        type: "MATERIAL_WARNING",
                        material: warning,
                        message: warning.message,
                        timestamp: new Date()
                    });
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
                lowStockAlerts: result.lowStockMaterials,
                materialWarnings: result.materialWarnings
            }
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
});

// ==================== ADMIN ONLY ROUTES ====================

// Create tasks from order (Admin only)
serviceTaskRoute.post("/", authToken, authRole("ADMIN"), async (req, res) => {
    try {
        const { orderId } = req.body;
        
        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: "Order ID is required"
            });
        }

        const tasks = await serviceTaskService.createTasksFromOrder(orderId);
        
        res.status(201).json({
            success: true,
            message: "Service tasks created successfully",
            data: tasks
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
});

// Assign staff to task (Admin only)
serviceTaskRoute.put("/:id/assign", authToken, authRole("ADMIN"), async (req, res) => {
    try {
        const { id } = req.params;
        const { staffId } = req.body;

        if (!staffId) {
            return res.status(400).json({
                success: false,
                message: "Staff ID is required"
            });
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
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
});

// Update task (Admin only)
serviceTaskRoute.put("/:id", authToken, authRole("ADMIN"), async (req, res) => {
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
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
});

// Delete task (Admin only)
serviceTaskRoute.delete("/:id", authToken, authRole("ADMIN"), async (req, res) => {
    try {
        const { id } = req.params;
        await serviceTaskService.deleteTask(id);

        res.status(200).json({
            success: true,
            message: "Task deleted successfully"
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = serviceTaskRoute;
