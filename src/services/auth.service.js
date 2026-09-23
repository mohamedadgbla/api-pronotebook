const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/token");

// Register a new user, then log them in (return tokens).
const register = async ({ name, username, email, password }) => {
  const exists = await User.findOne({ $or: [{ email }, { username }] });
  if (exists) {
    const field = exists.email === email ? "email" : "username";
    throw ApiError.conflict(`That ${field} is already registered`);
  }

  const user = await User.create({ name, username, email, password });
  return issueTokens(user);
};

// Log in with email OR username.
const login = async ({ identifier, password }) => {
  const user = await User.findOne({
    $or: [{ email: identifier.toLowerCase() }, { username: identifier.toLowerCase() }],
  }).select("+password +refreshTokens");

  if (!user) throw ApiError.unauthorized("Invalid credentials");
  if (user.status === "suspended") throw ApiError.forbidden("Account is suspended");

  const ok = await user.comparePassword(password);
  if (!ok) throw ApiError.unauthorized("Invalid credentials");

  user.lastLogin = new Date();
  return issueTokens(user);
};

// Rotate refresh tokens: verify the old one, replace it with a new one.
const refresh = async (refreshToken) => {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (_e) {
    throw ApiError.unauthorized("Invalid or expired refresh token");
  }

  const user = await User.findById(payload.id).select("+refreshTokens");
  if (!user || !user.refreshTokens.includes(refreshToken)) {
    throw ApiError.unauthorized("Refresh token not recognised");
  }

  // Remove the used token (rotation) and issue a fresh pair.
  user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
  const tokens = await issueTokens(user, { skipReload: true });
  return tokens;
};

// Log out this session (drop one refresh token) — or all sessions.
const logout = async (userId, refreshToken, allDevices = false) => {
  const user = await User.findById(userId).select("+refreshTokens");
  if (!user) return;
  user.refreshTokens = allDevices
    ? []
    : user.refreshTokens.filter((t) => t !== refreshToken);
  await user.save();
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select("+password +refreshTokens");
  if (!user) throw ApiError.notFound("User not found");

  const ok = await user.comparePassword(currentPassword);
  if (!ok) throw ApiError.badRequest("Current password is incorrect");

  user.password = newPassword; // hashed by the pre-save hook
  user.refreshTokens = []; // force re-login everywhere after a password change
  await user.save();
};

// Shared helper: create tokens, persist the refresh token, return safe user.
const issueTokens = async (user, { skipReload = false } = {}) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshTokens = [...(user.refreshTokens || []), refreshToken].slice(-10);
  await user.save();

  const safeUser = skipReload ? user : await User.findById(user._id);
  return { user: safeUser, accessToken, refreshToken };
};

module.exports = { register, login, refresh, logout, changePassword };
