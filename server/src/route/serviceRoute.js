const express = require("express")
const { getAllServices } = require("../controller/serviceController")

const serviceRoute = express.Router()

serviceRoute.get("/", getAllServices)

module.exports = serviceRoute