const catchAsync = require("../utils/catchAsync");
const { sendSuccess } = require("../utils/ApiResponse");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");

// Admin-only user management.
const list = catchAsync(async (_req, res) => {
  const data = await User.find().sort({ createdAt: -1 });
  sendSuccess(res, { message: "Users fetched", data });
});

const getOne = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound("User not found");
  sendSuccess(res, { message: "User fetched", data: user });
});

const setStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  if (!["active", "suspended"].includes(status)) {
    throw ApiError.badRequest("status must be 'active' or 'suspended'");
  }
  const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!user) throw ApiError.notFound("User not found");
  sendSuccess(res, { message: `User ${status}`, data: user });
});

const remove = catchAsync(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw ApiError.notFound("User not found");
  sendSuccess(res, { message: "User deleted" });
});

module.exports = { list, getOne, setStatus, remove };
