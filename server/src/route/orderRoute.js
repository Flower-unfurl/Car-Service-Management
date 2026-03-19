const express = require('express')
const router = express.Router()

const orderController = require('../controller/orderController')

// tạo order WALK-IN
router.post('/', orderController.createOrder)

module.exports = router