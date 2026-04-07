

const authService = require("../service/authService");
const emailUtils = require("../util/emailUtils");
const jwt = require("jsonwebtoken");
const User = require("../schema/userSchema");
const ErrorException = require("../util/errorException");
const { generateAccessToken, generateRefreshToken, verifyToken, decodeToken } = require("../util/tokenUtils");

const otpStore = new Map();


const resetOtpStore = new Map();

// ================= REQUEST RESET OTP =================
const requestResetOtp = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) throw new ErrorException(400, "Email is required");
        const user = await authService.findUserByEmail(email);
        if (!user) throw new ErrorException(400, "Email không tồn tại trong hệ thống");

        const otp = emailUtils.generateOTP(6);
        resetOtpStore.set(email, {
            otp,
            expiresAt: Date.now() + 300000
        });
        await emailUtils.sendOTPEmail(email, otp);
        res.status(200).json({ message: "Mã OTP đã được gửi đến email của bạn." });
    } catch (error) {
        next(error);
    }
};

// ================= VERIFY RESET OTP =================
const verifyResetOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) 
            throw new ErrorException(400, "Thiếu thông tin xác thực");

        const stored = resetOtpStore.get(email);
        if (!stored) 
            throw new ErrorException(400, "Mã OTP không tồn tại hoặc đã bị hủy.");

        if (Date.now() > stored.expiresAt) {
            resetOtpStore.delete(email);
            throw new ErrorException(400, "Mã OTP đã hết hạn.");
        }

        if (stored.otp !== otp) throw new ErrorException(400, "Mã OTP không chính xác.");
        res.status(200).json({ message: "OTP xác thực thành công" });
    } catch (error) {
        next(error);
    }
};

// ================= RESET PASSWORD =================
const resetPassword = async (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body;
   
        if (!email || !otp || !newPassword) 
            throw new ErrorException(400, "Thiếu thông tin");

        const stored = resetOtpStore.get(email);
        if (!stored) 
            throw new ErrorException(400, "Mã OTP không tồn tại hoặc đã bị hủy.");

        if (Date.now() > stored.expiresAt) {
            resetOtpStore.delete(email);
            throw new ErrorException(400, "Mã OTP đã hết hạn.");
        }

        if (stored.otp !== otp) throw new ErrorException(400, "Mã OTP không chính xác.");

        // Kiểm tra độ mạnh mật khẩu
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            throw new ErrorException(400, "Password must be at least 8 characters, include uppercase, lowercase, number and special character");
        }
        // Đổi mật khẩu
        await authService.updatePassword(email, newPassword);
        resetOtpStore.delete(email);
        res.status(200).json({ message: "Đổi mật khẩu thành công" });
    } catch (error) {
        next(error);
    }
};
// ================= LOGOUT =================
const logout = async (req, res, next) => {
    try {
        // Lấy userId từ middleware xác thực
        const userId = req.user?._id;
        if (userId) {
            await authService.saveRefreshToken(userId, null);
        }
        // Xóa cookie phía client
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: false,
            sameSite: "lax"
        });
        res.status(200).json({ message: "Đăng xuất thành công" });
    } catch (error) {
        next(error);
    }
};

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

        // Kiểm tra độ mạnh của mật khẩu
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
        if (!passwordRegex.test(password)) {
            throw new ErrorException(400, "Password must be at least 8 characters, include uppercase, lowercase, number and special character");
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

const getMe = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken;

        // Nếu không có token, trả về null ngay lập tức (không ném lỗi)
        if (!token) {
            return res.status(200).json({ user: null });
        }

        let userId, role;

        // 1. Thử verify access token còn hạn
        const decoded = verifyToken(token);

        if (decoded) {
            userId = decoded._id;
            console.log(userId)
            role = decoded.role;
        } else {
            // 2. Access token hết hạn → decode để lấy _id
            const decodedExpired = decodeToken(token);
            
            // Nếu token không hợp lệ (sai format, fake), trả về null
            if (!decodedExpired) {
                return res.status(200).json({ user: null });
            }

            // 3. Lấy và kiểm tra refresh token từ DB
            const refreshToken = await authService.getRefreshToken(decodedExpired._id);
            
            // Nếu không có refresh token hoặc refresh token hết hạn
            if (!refreshToken || !verifyToken(refreshToken)) {
                return res.status(200).json({ user: null });
            }

            // 4. Cấp access token mới nếu mọi thứ hợp lệ
            const newAccessToken = generateAccessToken(decodedExpired._id, decodedExpired.role);
            res.cookie("accessToken", newAccessToken, {
                httpOnly: true,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production", // Khuyên dùng cho thực tế
                maxAge: 15 * 60 * 1000
            });

            userId = decodedExpired._id;
        }

        console.log(userId)
        // 5. Lấy thông tin user từ DB
        const user = await authService.findUserById(userId);
console.log(user)
        // Nếu không tìm thấy user trong DB (user đã bị xóa)
        if (!user) {
            return res.status(200).json({ user: null });
        }

        // 6. Trả về thông tin user thành công
        return res.status(200).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        // Chỉ dùng next(error) cho các lỗi hệ thống (DB down, lỗi code...)
        // Vẫn nên trả về null để client xử lý mượt mà
        console.error("Error in getMe:", error);
        res.status(200).json({ user: null });
    }
};

module.exports = {
    getUsers,
    requestOtp,
    signUp,
    signIn,
    logout,
    requestResetOtp,
    verifyResetOtp,
    resetPassword,
    getMe
};