const errorException = (err, req, res, next) => {
    console.log("Error: ", err)

    const defaultMessage = "Something went wrong! Please try again!"
    const defaultStatusCode = 500

    const statusCode = err?.statusCode || defaultStatusCode
    const message = statusCode === 500 ? defaultMessage : err?.message

    return res.status(statusCode).json({ message: message })
}

module.exports = errorException