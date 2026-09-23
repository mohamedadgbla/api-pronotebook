const catchAsync = require("../utils/catchAsync");
const { sendSuccess } = require("../utils/ApiResponse");
const service = require("../services/folder.service");

const create = catchAsync(async (req, res) => {
  const data = await service.create(req.user.id, req.body);
  sendSuccess(res, { statusCode: 201, message: "Folder created", data });
});
const list = catchAsync(async (req, res) => {
  const data = await service.list(req.user.id);
  sendSuccess(res, { message: "Folders fetched", data });
});
const update = catchAsync(async (req, res) => {
  const data = await service.update(req.user.id, req.params.id, req.body);
  sendSuccess(res, { message: "Folder updated", data });
});
const remove = catchAsync(async (req, res) => {
  await service.destroy(req.user.id, req.params.id);
  sendSuccess(res, { message: "Folder deleted" });
});

module.exports = { create, list, update, remove };
