// Wraps an async controller so we never have to write try/catch in every
// handler. Any rejected promise is forwarded to Express's error handler.
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = catchAsync;
