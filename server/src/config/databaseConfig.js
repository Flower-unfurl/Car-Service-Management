const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

let isConnected = false;
const DATABASE_URL = process.env.MONGODB_URI

const connectDB = async () => {
    if (isConnected) {
        console.log('Sử dụng kết nối MongoDB hiện có.');
        return;
    }

    // Kiểm tra URI trước khi thực hiện kết nối
    if (!DATABASE_URL) {
        console.error('CRITICAL: MONGO_URI is undefined or empty!');
        process.exit(1);
    }

    try {
        console.log(`Attempting to connect to MongoDB... (URI length: ${DATABASE_URL.length})`);

        await mongoose.connect(DATABASE_URL, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000,
        });

        isConnected = true;
        console.log(`Connected to MongoDB at ${DATABASE_URL}`)
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;