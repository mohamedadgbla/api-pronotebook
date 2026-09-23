const app = require("./app");
const connectDB = require("./config/db");
const env = require("./config/env");

const start = async () => {
  await connectDB();
  app.listen(env.port, () => {
    console.log(`Claude ProNotebook API running on http://localhost:${env.port} (${env.nodeEnv})`);
  });
};

start();

// Safety nets so an unexpected error is logged, not swallowed silently.
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});
