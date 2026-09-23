const Tag = require("../models/Tag");
const Note = require("../models/Note");
const ApiError = require("../utils/ApiError");
const mongoose = require("mongoose");

const create = (ownerId, data) => Tag.create({ ...data, owner: ownerId });

const list = async (ownerId) => {
  const tags = await Tag.find({ owner: ownerId }).sort({ name: 1 }).lean();
  const counts = await Note.aggregate([
    { $match: { owner: new mongoose.Types.ObjectId(String(ownerId)), isDeleted: false } },
    { $unwind: "$tags" },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));
  return tags.map((t) => ({ ...t, usageCount: countMap[String(t._id)] || 0 }));
};

const update = async (ownerId, id, data) => {
  const tag = await Tag.findOneAndUpdate({ _id: id, owner: ownerId }, data, {
    new: true,
    runValidators: true,
  });
  if (!tag) throw ApiError.notFound("Tag not found");
  return tag;
};

const destroy = async (ownerId, id) => {
  const tag = await Tag.findOne({ _id: id, owner: ownerId });
  if (!tag) throw ApiError.notFound("Tag not found");
  await Note.updateMany({ owner: ownerId, tags: id }, { $pull: { tags: id } });
  await tag.deleteOne();
};

module.exports = { create, list, update, destroy };
