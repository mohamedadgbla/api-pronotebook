const catchAsync = require("../utils/catchAsync");
const { sendSuccess } = require("../utils/ApiResponse");
const service = require("../services/note.service");

const create = catchAsync(async (req, res) => {
  const data = await service.create(req.user.id, req.body);
  sendSuccess(res, { statusCode: 201, message: "Note created", data });
});

const list = catchAsync(async (req, res) => {
  const { items, pagination } = await service.list(req.user.id, req.query);
  sendSuccess(res, { message: "Notes fetched", data: items, pagination });
});

const getOne = catchAsync(async (req, res) => {
  const data = await service.getById(req.user.id, req.params.id);
  sendSuccess(res, { message: "Note fetched", data });
});

const update = catchAsync(async (req, res) => {
  const data = await service.update(req.user.id, req.params.id, req.body);
  sendSuccess(res, { message: "Note updated", data });
});

const move = catchAsync(async (req, res) => {
  const data = await service.move(req.user.id, req.params.id, req.body);
  sendSuccess(res, { message: "Note moved", data });
});

const duplicate = catchAsync(async (req, res) => {
  const data = await service.duplicate(req.user.id, req.params.id);
  sendSuccess(res, { statusCode: 201, message: "Note duplicated", data });
});

const remove = catchAsync(async (req, res) => {
  await service.softDelete(req.user.id, req.params.id);
  sendSuccess(res, { message: "Note moved to trash" });
});

const trash = catchAsync(async (req, res) => {
  const data = await service.listTrash(req.user.id);
  sendSuccess(res, { message: "Trash fetched", data });
});

const restore = catchAsync(async (req, res) => {
  const data = await service.restore(req.user.id, req.params.id);
  sendSuccess(res, { message: "Note restored", data });
});

const destroy = catchAsync(async (req, res) => {
  await service.destroy(req.user.id, req.params.id);
  sendSuccess(res, { message: "Note permanently deleted" });
});

const emptyTrash = catchAsync(async (req, res) => {
  await service.emptyTrash(req.user.id);
  sendSuccess(res, { message: "Trash emptied" });
});

module.exports = {
  create, list, getOne, update, move, duplicate,
  remove, trash, restore, destroy, emptyTrash,
};
