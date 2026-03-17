const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config()
let isConnected = false

const DATABASE_URL = process.env.MONGO_URI

const connectDB = async () => {
    if (isConnected) {
        return
    }

    try {
        await mongoose.connect(DATABASE_URL, {
            maxPoolSize: 10,
        })

        isConnected = true
        console.log(`Connected to MongoDB at ${DATABASE_URL}`)
    } catch (error) {
        console.error('MongoDB connection failed:', error.message)
        process.exit(1)
    }
}

module.exports = connectDB