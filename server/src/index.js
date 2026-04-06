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
const ticketRoute = require("./route/ticketRoute.js")
const brandRoute = require("./route/brandRoute.js")
const zoneRoute = require("./route/zoneRoute.js")
const materialRoute = require("./route/materialRoute.js")
const materialCategoryRoute = require("./route/materialCategoryRoute.js")
const inspectionRoute = require("./route/inspectionRoute.js")
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
    app.use("/ticket", ticketRoute)
    app.use("/brand", brandRoute)
    app.use("/zone", zoneRoute)
    app.use("/materials", materialRoute)
    app.use("/material-categories", materialCategoryRoute)
    app.use("/inspection", inspectionRoute)


    app.use(errorHandlerMiddleware)

    server.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`)
    })
})