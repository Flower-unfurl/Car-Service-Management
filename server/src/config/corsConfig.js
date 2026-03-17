const cors = require('cors')

const corsConfig = cors({
    origin: [
        `http://localhost:5173`,
    ],
    methods: ['Get', 'POST', 'PUT', 'DELETE'],
    optionsSuccessStatus: 200,
    credentials: true // sending with cookie
})

module.exports = corsConfig