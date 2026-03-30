const express = require("express");
const { signUp, requestOtp, signIn } = require("../controller/authController");
const { authToken } = require("../middleware/authMiddleware");

const authRoute = express.Router();

authRoute.post("/request-otp", requestOtp);
authRoute.post("/signup", signUp);
authRoute.post("/signin", authToken, signIn);

module.exports = authRoute;