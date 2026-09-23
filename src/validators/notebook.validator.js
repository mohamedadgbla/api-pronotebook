const Joi = require("joi");

const create = Joi.object({
  title: Joi.string().min(1).max(120).required(),
  description: Joi.string().allow("").max(500),
  color: Joi.string().max(30),
  icon: Joi.string().max(40),
  coverImage: Joi.string().uri().allow(null, ""),
  visibility: Joi.string().valid("private", "shared", "public"),
});

const update = Joi.object({
  title: Joi.string().min(1).max(120),
  description: Joi.string().allow("").max(500),
  color: Joi.string().max(30),
  icon: Joi.string().max(40),
  coverImage: Joi.string().uri().allow(null, ""),
  visibility: Joi.string().valid("private", "shared", "public"),
  isPinned: Joi.boolean(),
  isFavorite: Joi.boolean(),
  isArchived: Joi.boolean(),
}).min(1);

module.exports = { create, update };
