const catchAsync = require("../utils/catchAsync");
const { sendSuccess } = require("../utils/ApiResponse");
const authService = require("../services/auth.service");
const User = require("../models/User");

const register = catchAsync(async (req, res) => {
  const result = await authService.register(req.body);
  sendSuccess(res, { statusCode: 201, message: "Registered successfully", data: result });
});

const login = catchAsync(async (req, res) => {
  const result = await authService.login(req.body);
  sendSuccess(res, { message: "Logged in successfully", data: result });
});

const refresh = catchAsync(async (req, res) => {
  const result = await authService.refresh(req.body.refreshToken);
  sendSuccess(res, { message: "Token refreshed", data: result });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.user.id, req.body.refreshToken, req.body.allDevices);
  sendSuccess(res, { message: "Logged out successfully" });
});

const me = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);
  sendSuccess(res, { message: "Current user", data: user });
});

const updateProfile = catchAsync(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user.id, req.body, {
    new: true,
    runValidators: true,
  });
  sendSuccess(res, { message: "Profile updated", data: user });
});

const changePassword = catchAsync(async (req, res) => {
  await authService.changePassword(req.user.id, req.body);
  sendSuccess(res, { message: "Password changed. Please log in again." });
});

module.exports = { register, login, refresh, logout, me, updateProfile, changePassword };
