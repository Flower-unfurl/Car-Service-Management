const jwt = require("jsonwebtoken");

const generateAccessToken = (userId, role) => {
    return jwt.sign(
        { _id: userId, role },
        process.env.JWT_KEY,
        { expiresIn: "15m" }
    );
};

const generateRefreshToken = (userId) => {
    return jwt.sign(
        { _id: userId },
        process.env.JWT_KEY,
        { expiresIn: "7d" }
    );
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_KEY);
    } catch (err) {
        return null;
    }
};

const decodeToken = (token) => {
    return jwt.decode(token);
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
    decodeToken
};