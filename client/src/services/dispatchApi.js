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
};

export default dispatchApi;
