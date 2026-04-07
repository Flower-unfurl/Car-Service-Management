const User = require("../schema/userSchema");
const passwordUtils = require("../util/passwordUtils");
const { v4: uuidv4 } = require('uuid'); // npm install uuid nếu bạn muốn id dạng chuỗi

const authService = {
    findUserByEmail: async (email) => {
        return await User.findOne({ email });
    },

    register: async (userData) => {
        const { email, password, name } = userData;

        // 1. Kiểm tra email đã tồn tại chưa
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error("Email is already registered");
        }

        // 2. Mã hóa mật khẩu
        const hashedPassword = await passwordUtils.hashPassword(password);

        // 3. Tạo user mới
        const newUser = new User({
            id: uuidv4(), // Tạo ID duy nhất
            email,
            password: hashedPassword,
            name,
            role: "USER" // Mặc định là USER
        });

        return await newUser.save();
    },

    verifyCredentials: async (email, password) => {
        const user = await User.findOne({ email });
        if (!user) return null;

        // Giả định bạn có hàm comparePassword trong passwordUtils
        const isMatch = await passwordUtils.comparePassword(password, user.password);
        if (!isMatch) return null;

        return user;
    },

    // Thêm hàm lưu Refresh Token vào Database
    saveRefreshToken: async (userId, refreshToken) => {
        // Yêu cầu schema User của bạn phải có trường refreshToken
        await User.findByIdAndUpdate(userId, { refreshToken: refreshToken });
    },

    getRefreshToken: async (userId) => {
        const user = await User.findById(userId);
        if (!user || !user.refreshToken) return null;

        return user.refreshToken;
    },

    updatePassword: async (email, newPassword) => {
        const hashedPassword = await passwordUtils.hashPassword(newPassword);
        await User.findOneAndUpdate({ email }, { password: hashedPassword });
    },

    findUserById: async (id) => {
        return await User.findOne({ _id: id });
    }
};

module.exports = authService;