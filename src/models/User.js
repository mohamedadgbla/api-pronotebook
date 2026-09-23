const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    // "select: false" means the password hash is never returned by default.
    password: { type: String, required: true, select: false },
    profileImage: { type: String, default: null },
    bio: { type: String, default: "", maxlength: 300 },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isEmailVerified: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    lastLogin: { type: Date, default: null },
    // Multiple refresh tokens = multiple logged-in devices/sessions.
    refreshTokens: { type: [String], default: [], select: false },
  },
  { timestamps: true }
);

// Hash the password automatically before saving, but only if it changed.
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance helper to compare a plain password against the stored hash.
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Never leak sensitive fields when a user is serialised to JSON.
userSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.refreshTokens;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
