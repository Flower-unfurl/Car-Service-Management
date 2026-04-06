const express = require("express");
const { signUp, requestOtp, signIn, getUsers, logout, requestResetOtp, verifyResetOtp, resetPassword } = require("../controller/authController");
const { authToken } = require("../middleware/authMiddleware");

const authRoute = express.Router();

authRoute.get("/", getUsers)
authRoute.post("/request-otp", requestOtp);
authRoute.post("/signup", signUp);
authRoute.post("/signin", signIn);
authRoute.post("/logout", authToken, logout);
authRoute.post("/request-reset-otp", requestResetOtp);
authRoute.post("/verify-reset-otp", verifyResetOtp);
authRoute.post("/reset-password", resetPassword);

module.exports = authRoute;