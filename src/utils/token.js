const jwt = require("jsonwebtoken");
const env = require("../config/env");

// Access token: short-lived, sent on every request.
const generateAccessToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn,
  });

// Refresh token: long-lived, used only to get a new access token.
const generateRefreshToken = (user) =>
  jwt.sign({ id: user._id }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  });

const verifyAccessToken = (token) => jwt.verify(token, env.jwt.accessSecret);
const verifyRefreshToken = (token) => jwt.verify(token, env.jwt.refreshSecret);

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
