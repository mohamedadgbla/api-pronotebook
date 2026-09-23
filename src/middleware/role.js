const ApiError = require("../utils/ApiError");

// Restrict a route to specific roles, e.g. authorize("admin").
// Must run AFTER the auth middleware so req.user exists.
const authorize = (...allowedRoles) => (req, _res, next) => {
  if (!req.user) return next(ApiError.unauthorized("Not authenticated"));
  if (!allowedRoles.includes(req.user.role)) {
    return next(ApiError.forbidden("You do not have permission to do this"));
  }
  next();
};

module.exports = authorize;
