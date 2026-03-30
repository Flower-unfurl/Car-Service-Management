const orderService = require('../service/orderService')

const createOrder = async (req, res) => {
    try {
        const result = await orderService.createOrder(req.body)
        res.json(result)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

module.exports = {
    createOrder
}