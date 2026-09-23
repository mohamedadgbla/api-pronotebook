const mongoose = require("mongoose");
const env = require("./env");

// Connect to MongoDB. Called once at server startup.
const connectDB = async () => {
  if (!env.mongoUri) {
    console.error("MONGO_URI is not set. Add it to your .env file.");
    process.exit(1);
  }

  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(env.mongoUri);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
