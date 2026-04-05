const express = require("express")
const dotenv = require("dotenv")
const connectDB = require("./config/databaseConfig.js")
const corsConfig = require("./config/corsConfig.js")
const cookieParser = require("cookie-parser")
const http = require("http")

const serviceRoute = require("./route/serviceRoute.js")
const authRoute = require("./route/authRoute.js")
const errorHandlerMiddleware = require("./middleware/errorHandlerMiddleware.js")

dotenv.config()

const app = express()
const port = process.env.PORT ?? 3000

app.use(express.json())
app.use(cookieParser())
app.use(corsConfig)

const server = http.createServer(app)

connectDB().then(() => {
    app.use("/auth", authRoute)
    app.use("/service", serviceRoute)

    app.use(errorHandlerMiddleware)

    server.listen(port, () => {
        console.log(`🚀 Server running at http://localhost:${port}`)
    })
})