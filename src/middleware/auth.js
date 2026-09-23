const { verifyAccessToken } = require("../utils/token");
const ApiError = require("../utils/ApiError");

// Protect routes: require a valid "Authorization: Bearer <accessToken>".
// On success it attaches { id, role } to req.user.
module.exports = function auth(req, _res, next) {
  const header = req.header("Authorization");
  if (!header) return next(ApiError.unauthorized("No token, authorization denied"));

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return next(ApiError.unauthorized("Authorization format must be: Bearer <token>"));
  }

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch (_err) {
    next(ApiError.unauthorized("Token is invalid or has expired"));
  }
};
