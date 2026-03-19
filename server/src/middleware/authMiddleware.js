const authService = require("../service/authService");
const {
    generateAccessToken,
    verifyToken,
    decodeToken
} = require("../util/tokenUtils");

const authToken = async (req, res, next) => {
    const token = req.cookies?.accessToken;

    if (!token) {
        return res.status(401).json({
            message: "Please login to continue!"
        });
    }

    const decoded = verifyToken(token);

    if (decoded) {
        req.user = decoded;
        return next();
    }

    try {
        const decodedExpired = decodeToken(token);

        if (!decodedExpired) {
            console.log("Invalid token")
            return res.status(401).json({
                message: "Invalid token"
            });
        }

        const refreshToken = await authService.getRefreshToken(decodedExpired._id);

        if (!refreshToken) {
            console.log("No refresh token. Please login again!")
            return res.status(403).json({
                message: "No refresh token. Please login again!"
            });
        }

        const verifiedRefresh = verifyToken(refreshToken);

        if (!verifiedRefresh) {
            console.log("Session expired. Please login again!")
            return res.status(403).json({
                message: "Session expired. Please login again!"
            });
        }


        const newAccessToken = generateAccessToken(
            decodedExpired._id,
            decodedExpired.role
        );

        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 15 * 60 * 1000
        });

        req.user = decodedExpired;
console.log("Ok")
        return next();

    } catch (error) {
        return res.status(500).json({
            message: "Authentication error"
        });
    }
};

module.exports = {
    authToken
};