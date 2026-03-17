const User = require("../schema/userSchema");
const passwordUtils = require("../util/passwordUtils");
const { v4: uuidv4 } = require('uuid'); // npm install uuid nếu bạn muốn id dạng chuỗi

const authService = {
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
    }
};

module.exports = authService;