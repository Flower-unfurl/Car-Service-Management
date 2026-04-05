const express = require("express");
const { signUp, requestOtp, signIn, getUsers } = require("../controller/authController");
const { authToken } = require("../middleware/authMiddleware");

const authRoute = express.Router();

authRoute.get("/", getUsers)
authRoute.post("/request-otp", requestOtp);
authRoute.post("/signup", signUp);
authRoute.post("/signin", signIn);

module.exports = authRoute;