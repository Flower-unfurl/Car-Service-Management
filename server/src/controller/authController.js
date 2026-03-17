const authService = require("../service/authService");

const signUp = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const user = await authService.register({ name, email, password });

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

module.exports = {
    signUp
};