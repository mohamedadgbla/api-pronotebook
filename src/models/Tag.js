const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, lowercase: true, maxlength: 40 },
    color: { type: String, default: "#6b7280" },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// A user cannot have two tags with the same name.
tagSchema.index({ owner: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Tag", tagSchema);
