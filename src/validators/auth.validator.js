const Joi = require("joi");

const register = Joi.object({
  name: Joi.string().min(2).max(80).required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
});

const login = Joi.object({
  // Allow login with either email or username via a single "identifier".
  identifier: Joi.string().required(),
  password: Joi.string().required(),
});

const refresh = Joi.object({
  refreshToken: Joi.string().required(),
});

const updateProfile = Joi.object({
  name: Joi.string().min(2).max(80),
  bio: Joi.string().allow("").max(300),
  profileImage: Joi.string().uri().allow(null, ""),
}).min(1);

const changePassword = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).max(128).required(),
});

module.exports = { register, login, refresh, updateProfile, changePassword };
