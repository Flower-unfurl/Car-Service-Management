const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    // host: process.env.MAILHOST,
    // port: process.env.MAILPORT,
    service: "gmail",
    auth: {
        user: process.env.MAILUSER,
        pass: process.env.MAILPASSWORD,
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

    // Hàm gửi email
    sendOTPEmail: async (toEmail, otp) => {
        const mailOptions = {
            from: '"Car Service Support"',
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
            throw new Error("Không thể gửi email xác thực.");
        }
    },
};

module.exports = emailUtils;
