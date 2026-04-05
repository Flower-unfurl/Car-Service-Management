class ErrorException extends Error {
    constructor(statusCode, message) {
        if (typeof statusCode === "string") {
            super(statusCode)
            this.statusCode = 500
        } else {
            super(message)
            this.statusCode = statusCode || 500
        }
    }
}