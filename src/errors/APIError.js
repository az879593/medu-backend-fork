class APIError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;         
        this.name = "APIError";
    }
}

module.exports = APIError;