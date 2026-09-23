// A custom error class that carries an HTTP status code and optional
// field-level validation errors. Throw this anywhere; the central error
// handler turns it into a clean JSON response.
class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true; // expected error we deliberately threw
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg = "Bad request", errors = []) {
    return new ApiError(400, msg, errors);
  }
  static unauthorized(msg = "Unauthorized") {
    return new ApiError(401, msg);
  }
  static forbidden(msg = "Forbidden") {
    return new ApiError(403, msg);
  }
  static notFound(msg = "Resource not found") {
    return new ApiError(404, msg);
  }
  static conflict(msg = "Conflict") {
    return new ApiError(409, msg);
  }
}

module.exports = ApiError;
