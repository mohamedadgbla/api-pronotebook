const ApiError = require("../utils/ApiError");

// Any request that matched no route ends up here.
module.exports = function notFound(req, _res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};
