const Appointment = require("../schema/appointmentSchema");

const cronService = {
    // Tự động hủy lịch hẹn sau 10 phút nếu khách không tới (chưa đổi sang trạng thái ARRIVED)
    startAutoCancelJob: () => {
        console.log("CronJob: Auto-cancel appointments started...");
        setInterval(() => cronService.runManual(), 60000);
    },

    runManual: async () => {
        try {
            const now = new Date();
            const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
            const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);

            const emailUtils = require("../util/emailUtils");

            // 1. TỰ ĐỘNG HỦY (Nếu quá 10 phút)
            const expired = await Appointment.find({
                expectedTime: { $lt: tenMinutesAgo },
                status: "BOOKED"
            }).populate("serviceIds");

            if (expired.length > 0) {
                for (const app of expired) {
                    app.status = "CANCELLED";
                    await app.save();
                    if (app.email) {
                        await emailUtils.sendBookingCancelEmail(app.email, {
                            customerName: app.customerName,
                            expectedTime: app.expectedTime,
                            services: app.serviceIds.map(s => s.serviceName)
                        });
                    }
                }
                console.log(`Auto-cancelled and notified ${expired.length} expired appointments.`);
            }

            // 2. NHẮC NHỞ (Nếu còn 10 phút nữa đến hẹn)
            // Tìm các lịch BOOKED có dự kiến trong khoảng [now, now + 11m] và chưa được nhắc nhở (nếu có field reminder)
            // Hoặc đơn giản là quét mỗi phút cho các lịch hẹn sắp tới
            const upcoming = await Appointment.find({
                expectedTime: {
                    $gt: now,
                    $lt: new Date(now.getTime() + 11 * 60 * 1000)
                },
                status: "BOOKED",
                reminderSent: { $ne: true } // Cần thêm field này vào Schema
            }).populate("serviceIds");

            if (upcoming.length > 0) {
                for (const app of upcoming) {
                    if (app.email) {
                        await emailUtils.sendBookingReminderEmail(app.email, {
                            customerName: app.customerName,
                            expectedTime: app.expectedTime,
                            services: app.serviceIds.map(s => s.serviceName)
                        });
                        app.reminderSent = true;
                        await app.save();
                    }
                }
                console.log(`Sent reminders for ${upcoming.length} upcoming appointments.`);
            }

            return { cancelled: expired.length, reminded: upcoming.length };
        } catch (error) {
            console.error("CronJob Error:", error);
        }
    }
};

module.exports = cronService;
