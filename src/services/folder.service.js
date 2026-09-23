const Folder = require("../models/Folder");
const Note = require("../models/Note");
const ApiError = require("../utils/ApiError");

const create = async (ownerId, data) => {
  if (data.parent) await assertNoCycle(ownerId, null, data.parent);
  return Folder.create({ ...data, owner: ownerId });
};

const list = async (ownerId) => {
  const folders = await Folder.find({ owner: ownerId }).sort({ name: 1 }).lean();
  // Attach a note count to each folder for the sidebar UI.
  const counts = await Note.aggregate([
    { $match: { owner: toObjectId(ownerId), folder: { $ne: null }, isDeleted: false } },
    { $group: { _id: "$folder", count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));
  return folders.map((f) => ({ ...f, noteCount: countMap[String(f._id)] || 0 }));
};

const update = async (ownerId, id, data) => {
  const folder = await Folder.findOne({ _id: id, owner: ownerId });
  if (!folder) throw ApiError.notFound("Folder not found");
  if (data.parent) await assertNoCycle(ownerId, id, data.parent);
  Object.assign(folder, data);
  await folder.save();
  return folder;
};

const destroy = async (ownerId, id) => {
  const folder = await Folder.findOne({ _id: id, owner: ownerId });
  if (!folder) throw ApiError.notFound("Folder not found");
  // Re-parent children up one level and detach notes; never orphan data.
  await Folder.updateMany({ parent: id, owner: ownerId }, { parent: folder.parent });
  await Note.updateMany({ folder: id, owner: ownerId }, { folder: null });
  await folder.deleteOne();
};

// Prevent circular folder chains (a folder cannot become its own descendant).
const assertNoCycle = async (ownerId, folderId, parentId) => {
  if (folderId && String(folderId) === String(parentId)) {
    throw ApiError.badRequest("A folder cannot be its own parent");
  }
  let current = parentId;
  const seen = new Set();
  while (current) {
    if (folderId && String(current) === String(folderId)) {
      throw ApiError.badRequest("Circular folder structure is not allowed");
    }
    if (seen.has(String(current))) break;
    seen.add(String(current));
    const parent = await Folder.findOne({ _id: current, owner: ownerId }).select("parent");
    if (!parent) throw ApiError.badRequest("Parent folder does not exist");
    current = parent.parent;
  }
};

const mongoose = require("mongoose");
const toObjectId = (id) => new mongoose.Types.ObjectId(String(id));

module.exports = { create, list, update, destroy };
