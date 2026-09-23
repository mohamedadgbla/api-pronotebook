const ApiError = require("../utils/ApiError");

// Validate a request part ("body" | "query" | "params") against a Joi schema.
// abortEarly:false collects every error, not just the first.
const validate = (schema, property = "body") => (req, _res, next) => {
  const { error, value } = schema.validate(req[property], {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((d) => ({
      field: d.path.join("."),
      message: d.message.replace(/["]/g, ""),
    }));
    return next(ApiError.badRequest("Validation failed", errors));
  }

  req[property] = value; // use the cleaned/coerced value
  next();
};

module.exports = validate;
