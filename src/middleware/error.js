const mongoose = require("mongoose");
const ApiError = require("../utils/ApiError");
const env = require("../config/env");

// Central error handler. Every thrown/forwarded error lands here and is
// converted into our consistent error JSON shape. This keeps controllers
// clean and prevents leaking stack traces in production.
// eslint-disable-next-line no-unused-vars
module.exports = function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let errors = err.errors || [];

  // Mongoose: bad ObjectId
  if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose: schema validation
  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = "Validation failed";
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // MongoDB: duplicate key (unique index)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `That ${field} is already taken`;
  }

  if (statusCode >= 500) {
    console.error("ERROR:", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    ...(env.nodeEnv === "development" && statusCode >= 500
      ? { stack: err.stack }
      : {}),
  });
};
