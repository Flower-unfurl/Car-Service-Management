const Service = require('../schema/service')

const getAllServices = async (req, res) => {
    try {
        const services = await Service.find()
        res.json(services)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

module.exports = {
    getAllServices
}
