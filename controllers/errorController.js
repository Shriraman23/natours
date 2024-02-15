const AppError = require('../utility/appError');

const handleCastError = err => {
  const message = `invalid ${err.path}:${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateError = err => {
  const value = err.keyValue.name;
  const message = `Duplicate field value ${value} .Please use another values`;

  return new AppError(message, 400);
};

const handleValidationError = err => {
  const message = Object.values(err.errors)
    .map(el => {
      return el.message;
    })
    .join('. ');
  return new AppError(message, 400);
};

const sendErrDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    stack: err.stack,
    message: err.message
  });
};

const sendErrProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: `Not Operational error Something went very wrong.`
    });
  }
};
module.exports = (err, req, res, next) => {
  err.status = err.status || 'error';
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === 'development') {
    sendErrDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (err.name === 'CastError') {
      error = handleCastError(error);
    }
    if (err.code === 11000) {
      error = handleDuplicateError(error);
    }
    if (err.name === 'ValidationError') {
      error = handleValidationError(error);
    }
    sendErrProd(error, res);
  }
};
