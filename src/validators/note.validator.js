const Joi = require("joi");

const objectId = Joi.string().hex().length(24);

const checklistItem = Joi.object({
  text: Joi.string().min(1).max(500).required(),
  isDone: Joi.boolean(),
  dueDate: Joi.date().allow(null),
  priority: Joi.string().valid("low", "medium", "high"),
});

const create = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  content: Joi.string().allow("").default(""),
  contentFormat: Joi.string().valid("markdown", "plain", "richtext-json"),
  notebook: objectId.required(),
  folder: objectId.allow(null),
  tags: Joi.array().items(objectId),
  checklist: Joi.array().items(checklistItem),
  color: Joi.string().allow(null, ""),
  reminderDate: Joi.date().allow(null),
});

const update = Joi.object({
  title: Joi.string().min(1).max(200),
  content: Joi.string().allow(""),
  contentFormat: Joi.string().valid("markdown", "plain", "richtext-json"),
  folder: objectId.allow(null),
  tags: Joi.array().items(objectId),
  checklist: Joi.array().items(checklistItem),
  color: Joi.string().allow(null, ""),
  reminderDate: Joi.date().allow(null),
  isPinned: Joi.boolean(),
  isFavorite: Joi.boolean(),
  isArchived: Joi.boolean(),
  isLocked: Joi.boolean(),
}).min(1);

const move = Joi.object({
  notebook: objectId.required(),
  folder: objectId.allow(null),
});

const listQuery = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  search: Joi.string().allow(""),
  notebook: objectId,
  folder: objectId,
  tag: objectId,
  filter: Joi.string().valid("favorite", "pinned", "archived"),
  sort: Joi.string().valid("newest", "oldest", "updated", "title"),
});

module.exports = { create, update, move, listQuery };
