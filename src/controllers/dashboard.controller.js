const catchAsync = require("../utils/catchAsync");
const { sendSuccess } = require("../utils/ApiResponse");
const service = require("../services/dashboard.service");

const userDashboard = catchAsync(async (req, res) => {
  const data = await service.userDashboard(req.user.id);
  sendSuccess(res, { message: "Dashboard", data });
});

const adminDashboard = catchAsync(async (_req, res) => {
  const data = await service.adminDashboard();
  sendSuccess(res, { message: "Admin dashboard", data });
});

module.exports = { userDashboard, adminDashboard };
