const express = require("express");
const { signUp } = require("../controller/authController");

const authRoute = express.Router()

authRoute.post("/signup", signUp);

module.exports = authRoute