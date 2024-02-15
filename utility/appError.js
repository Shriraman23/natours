class AppError extends Error {
  constructor(message, statuscode) {
    super(message);
    this.statusCode = statuscode;
    this.status = `${this.statusCode}`.startsWith('4') ? 'fail' : 'Error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
