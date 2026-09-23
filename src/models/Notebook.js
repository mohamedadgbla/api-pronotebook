const mongoose = require("mongoose");

const notebookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: "", maxlength: 500 },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    coverImage: { type: String, default: null },
    color: { type: String, default: "#4f46e5" },
    icon: { type: String, default: "notebook" },
    visibility: {
      type: String,
      enum: ["private", "shared", "public"],
      default: "private",
    },
    isPinned: { type: Boolean, default: false },
    isFavorite: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Common query pattern: "all live notebooks for this owner".
notebookSchema.index({ owner: 1, isDeleted: 1, isArchived: 1 });

module.exports = mongoose.model("Notebook", notebookSchema);
