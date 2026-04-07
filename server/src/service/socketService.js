// Socket.io service for realtime notifications
let io = null;

const socketService = {
    // Initialize Socket.io instance
    initialize: (socketIoInstance) => {
        io = socketIoInstance;
        console.log("✅ Socket.io service initialized");
    },

    // Get Socket.io instance
    getIO: () => {
        if (!io) {
            throw new Error("Socket.io has not been initialized");
        }
        return io;
    },

    // Emit event to specific user (by userId)
    emitToUser: (userId, eventName, data) => {
        if (!io) return;
        io.to(`user-${userId}`).emit(eventName, data);
    },

    // Emit event to specific ticket/booking room
    emitToTicket: (ticketId, eventName, data) => {
        if (!io) return;
        io.to(`ticket-${ticketId}`).emit(eventName, data);
    },

    // Emit event to all admins
    emitToAdmins: (eventName, data) => {
        if (!io) return;
        io.to("admins").emit(eventName, data);
    },

    // Emit event to all staff
    emitToStaff: (eventName, data) => {
        if (!io) return;
        io.to("staff").emit(eventName, data);
    },

    // Emit to all connected clients
    emitToAll: (eventName, data) => {
        if (!io) return;
        io.emit(eventName, data);
    },

    // Notification helpers
    notifyTaskStarted: (ticketId, taskData) => {
        socketService.emitToTicket(ticketId, "task:started", {
            type: "TASK_STARTED",
            ticketId,
            task: taskData,
            message: `Dịch vụ "${taskData.serviceId?.serviceName}" đang được thực hiện`,
            timestamp: new Date()
        });

        // Also notify admins
        socketService.emitToAdmins("task:started", {
            type: "TASK_STARTED",
            ticketId,
            task: taskData,
            timestamp: new Date()
        });
    },

    notifyTaskCompleted: (ticketId, taskData, materialUsageRecords = []) => {
        socketService.emitToTicket(ticketId, "task:completed", {
            type: "TASK_COMPLETED",
            ticketId,
            task: taskData,
            materialUsage: materialUsageRecords,
            message: `Dịch vụ "${taskData.serviceId?.serviceName}" đã hoàn thành`,
            timestamp: new Date()
        });

        // Also notify admins
        socketService.emitToAdmins("task:completed", {
            type: "TASK_COMPLETED",
            ticketId,
            task: taskData,
            materialUsage: materialUsageRecords,
            timestamp: new Date()
        });
    },

    notifyLowStock: (materialData) => {
        socketService.emitToAdmins("material:low-stock", {
            type: "LOW_STOCK_ALERT",
            material: materialData,
            message: `Cảnh báo: Vật tư "${materialData.materialName}" sắp hết (Còn ${materialData.remainingStock})`,
            timestamp: new Date()
        });
    },

    notifyProgressUpdate: (ticketId, progressData) => {
        socketService.emitToTicket(ticketId, "progress:update", {
            type: "PROGRESS_UPDATE",
            ticketId,
            progress: progressData,
            timestamp: new Date()
        });

        // Also to admins
        socketService.emitToAdmins("progress:update", {
            type: "PROGRESS_UPDATE",
            ticketId,
            progress: progressData,
            timestamp: new Date()
        });
    },

    notifyStaffAssigned: (staffId, taskData) => {
        socketService.emitToUser(staffId, "task:assigned", {
            type: "TASK_ASSIGNED",
            task: taskData,
            message: `Bạn được giao nhiệm vụ: ${taskData.serviceId?.serviceName}`,
            timestamp: new Date()
        });
    }
};

module.exports = socketService;
