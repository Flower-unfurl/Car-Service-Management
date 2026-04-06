const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

const emailUtils = {
    // Hàm tạo mã OTP ngẫu nhiên
    generateOTP: (length = 6) => {
        return Math.floor(
            Math.pow(10, length - 1) +
            Math.random() * 9 * Math.pow(10, length - 1),
        ).toString();
    },

    // Hàm gửi email OTP
    sendOTPEmail: async (toEmail, otp) => {
        const mailOptions = {
            from: '"Car Service Support" <support@carservice.com>',
            to: toEmail,
            subject: "Mã xác thực đăng ký tài khoản (OTP)",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #1e5aa0;">Xác thực tài khoản của bạn</h2>
                    <p>Chào bạn,</p>
                    <p>Mã OTP để hoàn tất đăng ký tài khoản của bạn là:</p>
                    <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e5aa0; padding: 10px 0;">
                        ${otp}
                    </div>
                    <p>Mã này có hiệu lực trong vòng 5 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
                </div>
            `,
        };

        try {
            await transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error("Email error: ", error);
            return false;
        }
    },

    // Hàm gửi email xác nhận đặt lịch
    sendBookingConfirmEmail: async (toEmail, bookingData) => {
        const { customerName, expectedTime, services, zoneName, licensePlate, totalPrice } = bookingData;
        const dateStr = new Date(expectedTime).toLocaleString('vi-VN');

        const mailOptions = {
            from: '"Car Service Support" <support@carservice.com>',
            to: toEmail,
            subject: "Xác nhận đặt lịch hẹn thành công - Car Service",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #1e5aa0;">Xác nhận đặt lịch hẹn</h2>
                    <p>Chào <b>${customerName}</b>,</p>
                    <p>Cảm ơn bạn đã tin tưởng dịch vụ của chúng tôi. Lịch hẹn của bạn đã được xác nhận:</p>
                    <ul style="list-style: none; padding: 0;">
                        <li><b>Biển số xe:</b> ${licensePlate}</li>
                        <li><b>Thời gian:</b> ${dateStr}</li>
                        <li><b>Dịch vụ:</b> ${services.join(", ")}</li>
                        <li><b>Tổng thanh toán:</b> <span style="color: #1e5aa0; font-weight: bold;">$${totalPrice.toFixed(2)}</span></li>
                        <li><b>Khu vực thực hiện:</b> ${zoneName}</li>
                    </ul>
                    <p>Vui lòng đến đúng giờ để được phục vụ tốt nhất. Hẹn gặp lại bạn!</p>
                </div>
            `,
        };

        try {
            await transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error("Email error: ", error);
            return false;
        }
    },

    // Hàm gửi email thông báo hủy lịch
    sendBookingCancelEmail: async (toEmail, bookingData) => {
        const { customerName, expectedTime, services } = bookingData;
        const dateStr = new Date(expectedTime).toLocaleString('vi-VN');

        const mailOptions = {
            from: '"Car Service Support" <support@carservice.com>',
            to: toEmail,
            subject: "Thông báo hủy lịch hẹn tự động - Car Service",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #d9534f;">Thông báo hủy lịch hẹn</h2>
                    <p>Chào <b>${customerName}</b>,</p>
                    <p>Chúng tôi rất tiếc phải thông báo rằng lịch hẹn của bạn đã bị <b>hủy tự động</b> do bạn chưa đến đúng giờ hẹn (quá 10 phút).</p>
                    <hr/>
                    <p><b>Thông tin lịch đã hủy:</b></p>
                    <ul style="list-style: none; padding: 0;">
                        <li><b>Thời gian:</b> ${dateStr}</li>
                        <li><b>Dịch vụ:</b> ${services.join(", ")}</li>
                    </ul>
                    <hr/>
                    <p>Nếu bạn vẫn muốn sử dụng dịch vụ, vui lòng thực hiện đặt lịch mới trên website. Hẹn gặp lại bạn!</p>
                </div>
            `,
        };

        try {
            await transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error("Email error: ", error);
            return false;
        }
    },

    // Hàm gửi email nhắc nhở trước giờ hẹn
    sendBookingReminderEmail: async (toEmail, bookingData) => {
        const { customerName, expectedTime, services } = bookingData;
        const dateStr = new Date(expectedTime).toLocaleString('vi-VN');

        const mailOptions = {
            from: '"Car Service Support" <support@carservice.com>',
            to: toEmail,
            subject: "Nhắc nhở lịch hẹn sắp tới - Car Service",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #1e5aa0; border-radius: 10px;">
                    <h2 style="color: #1e5aa0;">Nhắc nhở lịch hẹn</h2>
                    <p>Chào <b>${customerName}</b>,</p>
                    <p>Đây là thông báo nhắc nhở bạn có lịch hẹn sắp tới trong <b>10 phút nữa</b>.</p>
                    <hr/>
                    <ul style="list-style: none; padding: 0;">
                        <li><b>Thời gian:</b> ${dateStr}</li>
                        <li><b>Dịch vụ:</b> ${services.join(", ")}</li>
                    </ul>
                    <hr/>
                    <p>Rất mong được phục vụ bạn đúng giờ!</p>
                </div>
            `,
        };

        try {
            await transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error("Email error: ", error);
            return false;
        }
    }
};

module.exports = emailUtils;
