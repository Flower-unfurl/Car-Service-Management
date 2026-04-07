import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000",
    withCredentials: true,
});

const unwrapData = (response) => response?.data?.data ?? response?.data;

export const getErrorMessage = (error, fallback = "Đã có lỗi xảy ra") => {
    return error?.response?.data?.message || error?.message || fallback;
};

const dispatchApi = {
    getServiceDropdown: async ({ page = 1, limit = 4 } = {}) => {
        const res = await api.get("/service/dropdown", {
            params: { page, limit }
        });
        return res?.data;
    },

    getTickets: async () => {
        const res = await api.get("/ticket");
        return unwrapData(res);
    },

    getTicketById: async (ticketId) => {
        const res = await api.get(`/ticket/${ticketId}`);
        return unwrapData(res);
    },

    getTasksByTicket: async (ticketId) => {
        const res = await api.get(`/service-task/ticket/${ticketId}`);
        return unwrapData(res);
    },

    getTicketProgress: async (ticketId) => {
        const res = await api.get(`/service-task/ticket/${ticketId}/progress`);
        return unwrapData(res);
    },

    getGuestTasksByQrToken: async (qrToken) => {
        const res = await api.get(`/service-task/guest/${qrToken}/tasks`);
        return unwrapData(res);
    },

    getGuestProgressByQrToken: async (qrToken) => {
        const res = await api.get(`/service-task/guest/${qrToken}/progress`);
        return unwrapData(res);
    },

    getGuestMaterialUsageByQrToken: async (qrToken) => {
        const res = await api.get(`/service-task/guest/${qrToken}/material-usage`);
        return unwrapData(res);
    },

    getMaterialUsageByTicket: async (ticketId) => {
        const res = await api.get(`/service-task/ticket/${ticketId}/material-usage`);
        return unwrapData(res);
    },

    getMyTasks: async () => {
        const res = await api.get("/service-task/my-tasks");
        return unwrapData(res);
    },

    startTask: async (taskId) => {
        const res = await api.post(`/service-task/${taskId}/start`);
        return unwrapData(res);
    },

    completeTask: async (taskId) => {
        const res = await api.post(`/service-task/${taskId}/complete`);
        return res?.data;
    },

    getRecommendedStaff: async (taskId) => {
        const res = await api.get(`/service-task/${taskId}/recommend-staff`);
        return unwrapData(res);
    },

    assignTask: async (taskId, staffId) => {
        const res = await api.put(`/service-task/${taskId}/assign`, { staffId });
        return unwrapData(res);
    },

    addTaskSupportStaff: async (taskId, supportStaffId) => {
        const res = await api.put(`/service-task/${taskId}/support`, { supportStaffId });
        return unwrapData(res);
    },

    createFullEntry: async (payload) => {
        const res = await api.post("/ticket/full-entry", payload);
        return unwrapData(res);
    },

    addServicesToTicketFlow: async (ticketId, serviceIds) => {
        const res = await api.post(`/ticket/${ticketId}/services`, { serviceIds });
        return unwrapData(res);
    },

    getTicketInvoice: async (ticketId) => {
        const res = await api.get(`/ticket/${ticketId}/invoice`);
        return unwrapData(res);
    },

    updateInvoiceDraft: async (ticketId, includeParkingFee) => {
        const res = await api.patch(`/ticket/${ticketId}/invoice-draft`, { includeParkingFee });
        return unwrapData(res);
    },

    confirmInvoice: async (ticketId) => {
        const res = await api.post(`/ticket/${ticketId}/invoice-confirm`);
        return unwrapData(res);
    },

    confirmInvoicePayment: async (ticketId) => {
        const res = await api.post(`/ticket/${ticketId}/payment-confirm`);
        return unwrapData(res);
    },

    getGuestInvoiceByQrToken: async (qrToken) => {
        const res = await api.get(`/ticket/guest/${qrToken}/invoice`);
        return unwrapData(res);
    },
    getAppointmentsByPhone: async (phone) => {
        const res = await api.get(`/appointment/lookup/${phone}`);
        return unwrapData(res);
    },
};

export default dispatchApi;
