require("dotenv").config();

// Centralised, validated environment access.
// Everything that reads process.env should read it from here.
const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,

  mongoUri: process.env.MONGO_URI,

  jwt: {
    accessSecret: process.env.JWT_SECRET || "dev_access_secret_change_me",
    accessExpiresIn: process.env.JWT_EXPIRES_IN || "15m",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "dev_refresh_secret_change_me",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },

  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",

  trashRetentionDays: Number(process.env.TRASH_RETENTION_DAYS || 30),
};

module.exports = env;
