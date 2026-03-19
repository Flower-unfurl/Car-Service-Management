const Order = require('../schema/order')
const ServiceTask = require('../schema/serviceTask')
const { v4: uuidv4 } = require('uuid')

const createOrder = async (data) => {
  const { customerPhone, customerName, licensePlate, brand, services } = data

  // tạo mã QR
  const qrToken = uuidv4()

  // tạo order
  const order = await Order.create({
    customerPhone,
    customerName,
    licensePlate,
    brand,
    qrToken
  })

  // tạo danh sách task
  const tasks = services.map((serviceId, index) => ({
    orderId: order._id,
    serviceId,
    stepOrder: index + 1
  }))

  await ServiceTask.insertMany(tasks)

  return {
    message: 'Order created successfully',
    order
  }
}

module.exports = {
  createOrder
}