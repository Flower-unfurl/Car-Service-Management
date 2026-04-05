const authService = require("../service/authService");
const emailUtils = require("../util/emailUtils");
const jwt = require("jsonwebtoken")
const User = require("../schema/userSchema");

const otpStore = new Map();

const getUsers = async (req, res) => {
    try {
        const users = await User.find()
        console.log(users)
        res.send(users)
    } catch (error) {
        console.log(error)
    }
}

const requestOtp = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const existingUser = await authService.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "Email này đã được đăng ký. Vui lòng đăng nhập." });
        }

        // Tạo mã OTP
        const otp = emailUtils.generateOTP(6);

        // Lưu OTP vào bộ nhớ với thời hạn 5 phút (300000 ms)
        otpStore.set(email, { otp, expiresAt: Date.now() + 300000 });

        // Gửi email
        await emailUtils.sendOTPEmail(email, otp);

        res.status(200).json({ message: "Mã OTP đã được gửi đến email của bạn." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const signUp = async (req, res) => {
    try {
        const { name, email, password, otp } = req.body;

        if (!name || !email || !password || !otp) {
            return res.status(400).json({ message: "Vui lòng cung cấp đủ thông tin và mã OTP" });
        }

        // 1. Lấy OTP từ nơi lưu trữ
        const storedOtpData = otpStore.get(email);

        // 2. Kiểm tra tính hợp lệ của OTP
        if (!storedOtpData) {
            return res.status(400).json({ message: "Mã OTP không tồn tại hoặc đã bị hủy. Vui lòng thử lại." });
        }
        if (Date.now() > storedOtpData.expiresAt) {
            otpStore.delete(email); // Xóa OTP hết hạn
            return res.status(400).json({ message: "Mã OTP đã hết hạn." });
        }
        if (storedOtpData.otp !== otp) {
            return res.status(400).json({ message: "Mã OTP không chính xác." });
        }

        // 3. OTP hợp lệ -> Lưu user vào Database
        const user = await authService.register({ name, email, password });

        // 4. Xóa OTP sau khi sử dụng thành công
        otpStore.delete(email);

        res.status(200).json({
            message: "User registered successfully",
            data: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu" });
        }

        const user = await authService.verifyCredentials(email, password);
        if (!user) {
            return res.status(401).json({ message: "Email hoặc mật khẩu không chính xác" });
        }

        const accessToken = jwt.sign(
            { _id: user._id, role: user.role },
            process.env.JWT_KEY,
            { expiresIn: '15m' }
        );

        const refreshTokenSecret = process.env.JWT_KEY
        const refreshToken = jwt.sign(
            { _id: user._id },
            refreshTokenSecret,
            { expiresIn: '7d' }
        );

        await authService.saveRefreshToken(user._id, refreshToken);
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax', // ✅ đổi lại
            maxAge: 15 * 60 * 1000
        });

        res.status(200).json({
            message: "Đăng nhập thành công",
            data: {
                id: user.id || user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    requestOtp,
    signUp,
    signIn,
    getUsers
};