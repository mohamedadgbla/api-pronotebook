const Joi = require("joi");
const objectId = Joi.string().hex().length(24);

const create = Joi.object({
  name: Joi.string().min(1).max(120).required(),
  notebook: objectId.allow(null),
  parent: objectId.allow(null),
});

const update = Joi.object({
  name: Joi.string().min(1).max(120),
  parent: objectId.allow(null),
}).min(1);

module.exports = { create, update };
