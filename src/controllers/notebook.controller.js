const catchAsync = require("../utils/catchAsync");
const { sendSuccess } = require("../utils/ApiResponse");
const service = require("../services/notebook.service");

const create = catchAsync(async (req, res) => {
  const data = await service.create(req.user.id, req.body);
  sendSuccess(res, { statusCode: 201, message: "Notebook created", data });
});

const list = catchAsync(async (req, res) => {
  const data = await service.list(req.user.id, {
    includeArchived: req.query.includeArchived === "true",
    trashed: req.query.trashed === "true",
  });
  sendSuccess(res, { message: "Notebooks fetched", data });
});

const getOne = catchAsync(async (req, res) => {
  const data = await service.getById(req.user.id, req.params.id);
  sendSuccess(res, { message: "Notebook fetched", data });
});

const update = catchAsync(async (req, res) => {
  const data = await service.update(req.user.id, req.params.id, req.body);
  sendSuccess(res, { message: "Notebook updated", data });
});

const remove = catchAsync(async (req, res) => {
  await service.softDelete(req.user.id, req.params.id);
  sendSuccess(res, { message: "Notebook moved to trash" });
});

const restore = catchAsync(async (req, res) => {
  const data = await service.restore(req.user.id, req.params.id);
  sendSuccess(res, { message: "Notebook restored", data });
});

const destroy = catchAsync(async (req, res) => {
  await service.destroy(req.user.id, req.params.id);
  sendSuccess(res, { message: "Notebook permanently deleted" });
});

const duplicate = catchAsync(async (req, res) => {
  const data = await service.duplicate(req.user.id, req.params.id);
  sendSuccess(res, { statusCode: 201, message: "Notebook duplicated", data });
});

const stats = catchAsync(async (req, res) => {
  const data = await service.stats(req.user.id, req.params.id);
  sendSuccess(res, { message: "Notebook stats", data });
});

module.exports = { create, list, getOne, update, remove, restore, destroy, duplicate, stats };
