const Joi = require("joi");

const create = Joi.object({
  name: Joi.string().min(1).max(40).required(),
  color: Joi.string().max(30),
});

const update = Joi.object({
  name: Joi.string().min(1).max(40),
  color: Joi.string().max(30),
}).min(1);

module.exports = { create, update };
