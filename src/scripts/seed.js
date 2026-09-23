// Seed the database with a demo user + admin and some sample content.
// Run with:  node src/scripts/seed.js
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Notebook = require("../models/Notebook");
const Note = require("../models/Note");
const Tag = require("../models/Tag");

const run = async () => {
  await connectDB();
  console.log("Clearing existing demo data...");
  await Promise.all([
    User.deleteMany({ email: { $in: ["demo@pronotebook.dev", "admin@pronotebook.dev"] } }),
  ]);

  const demo = await User.create({
    name: "Demo User",
    username: "demo",
    email: "demo@pronotebook.dev",
    password: "password123",
    isEmailVerified: true,
  });

  const admin = await User.create({
    name: "Admin",
    username: "admin",
    email: "admin@pronotebook.dev",
    password: "password123",
    role: "admin",
    isEmailVerified: true,
  });

  const tag = await Tag.create({ name: "welcome", color: "#22c55e", owner: demo._id });

  const notebook = await Notebook.create({
    title: "Getting Started",
    description: "Your first notebook",
    owner: demo._id,
    color: "#4f46e5",
    isPinned: true,
  });

  await Note.create({
    title: "Welcome to ProNotebook 👋",
    content: "# Welcome!\n\nThis is your first **note**.\n\n- It supports markdown\n- Try creating your own notebook",
    owner: demo._id,
    notebook: notebook._id,
    tags: [tag._id],
    isFavorite: true,
    lastEditedBy: demo._id,
  });

  console.log("\nSeed complete.");
  console.log("  Demo  ->  demo@pronotebook.dev  / password123");
  console.log("  Admin ->  admin@pronotebook.dev / password123");
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
