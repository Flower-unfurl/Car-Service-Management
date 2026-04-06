const express = require("express")
const dotenv = require("dotenv")
const connectDB = require("./config/databaseConfig.js")
const corsConfig = require("./config/corsConfig.js")
const cookieParser = require("cookie-parser")
const http = require("http")
const dns = require("dns")
const serviceRoute = require("./route/serviceRoute.js")
const authRoute = require("./route/authRoute.js")
const bookingRoute = require("./route/bookingRoute.js")
const cronService = require("./service/cronService.js")
const errorHandlerMiddleware = require("./middleware/errorHandlerMiddleware.js")

dotenv.config()
dns.setServers(["1.1.1.1", "8.8.8.8"])

// Start background jobs
cronService.startAutoCancelJob();
const app = express()
const port = process.env.PORT ?? 3000

app.use(express.json())
app.use(cookieParser())
app.use(corsConfig)

const server = http.createServer(app)

connectDB().then(() => {
    app.use("/auth", authRoute)
    app.use("/service", serviceRoute)
    app.use("/booking", bookingRoute)

    app.use(errorHandlerMiddleware)

    server.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`)
    })
})