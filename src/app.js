const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const env = require("./config/env");
const routes = require("./routes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/error");

const app = express();

// ---- core middleware ----
app.use(helmet()); // sets secure HTTP headers
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
if (env.nodeEnv !== "test") app.use(morgan("dev"));

// ---- rate limiting (basic brute-force / abuse protection) ----
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later" },
});
app.use("/api", limiter);

// ---- health check (used by Railway/Render) ----
app.get("/api/health", (_req, res) =>
  res.json({ success: true, message: "ProNotebook API is healthy", uptime: process.uptime() })
);

// app.get("/", (req, res) => {
//   res.json({ success: true, message: "ProNotebook API is running" });
// });
// ---- API v1 ----
app.use("/api/v1", routes);

// ---- fallbacks ----
app.use(notFound);
app.use(errorHandler);

module.exports = app;
