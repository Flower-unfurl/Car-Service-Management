const authService = require("../service/authService");
const emailUtils = require("../util/emailUtils");
const jwt = require("jsonwebtoken");
const User = require("../schema/userSchema");
const ErrorException = require("../util/errorException");

const otpStore = new Map();

// ================= GET USERS =================
const getUsers = async (req, res, next) => {
    try {
        const users = await User.find();
        res.send(users);
    } catch (error) {
        next(error);
    }
};

// ================= REQUEST OTP =================
const requestOtp = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            throw new ErrorException(400, "All fields are required");
        }

        if (password.length < 6) {
            throw new ErrorException(400, "Password must be at least 6 characters");
        }

        const existingUser = await authService.findUserByEmail(email);
        if (existingUser) {
            throw new ErrorException(400, "Email này đã được đăng ký. Vui lòng đăng nhập.");
        }

        // Tạo OTP
        const otp = emailUtils.generateOTP(6);

        // Lưu OTP (5 phút)
        otpStore.set(email, {
            otp,
            expiresAt: Date.now() + 300000
        });

        // Gửi email
        await emailUtils.sendOTPEmail(email, otp);

        res.status(200).json({
            message: "Mã OTP đã được gửi đến email của bạn."
        });

    } catch (error) {
        next(error);
    }
};

// ================= SIGN UP =================
const signUp = async (req, res, next) => {
    try {
        const { name, email, password, otp } = req.body;

        if (!name || !email || !password || !otp) {
            throw new ErrorException(400, "Vui lòng cung cấp đủ thông tin và mã OTP");
        }

        const storedOtpData = otpStore.get(email);

        if (!storedOtpData) {
            throw new ErrorException(400, "Mã OTP không tồn tại hoặc đã bị hủy.");
        }

        if (Date.now() > storedOtpData.expiresAt) {
            otpStore.delete(email);
            throw new ErrorException(400, "Mã OTP đã hết hạn.");
        }

        if (storedOtpData.otp !== otp) {
            throw new ErrorException(400, "Mã OTP không chính xác.");
        }

        // Tạo user
        const user = await authService.register({ name, email, password });

        // Xóa OTP sau khi dùng
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
        next(error);
    }
};

// ================= SIGN IN =================
const signIn = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new ErrorException(400, "Vui lòng nhập email và mật khẩu");
        }

        const user = await authService.verifyCredentials(email, password);

        if (!user) {
            throw new ErrorException(401, "Email hoặc mật khẩu không chính xác");
        }

        // Access token
        const accessToken = jwt.sign(
            { _id: user._id, role: user.role },
            process.env.JWT_KEY,
            { expiresIn: "15m" }
        );

        // Refresh token
        const refreshToken = jwt.sign(
            { _id: user._id },
            process.env.JWT_KEY,
            { expiresIn: "7d" }
        );

        await authService.saveRefreshToken(user._id, refreshToken);

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
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
        next(error);
    }
};

module.exports = {
    getUsers,
    requestOtp,
    signUp,
    signIn
};