const mongoose = require("mongoose");

// Checklist item lives inside a note (embedded) because it has no meaning
// on its own and is always read/written together with its note.
const checklistItemSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true, maxlength: 500 },
    isDone: { type: Boolean, default: false },
    dueDate: { type: Date, default: null },
    priority: { type: String, enum: ["low", "medium", "high"], default: "low" },
  },
  { _id: true, timestamps: true }
);

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    // For the first implementation we store content as a Markdown string.
    // It is easy to render in React (react-markdown) and easy to validate.
    // contentFormat is kept so we can later add "richtext-json" without a
    // breaking change.
    content: { type: String, default: "" },
    contentFormat: {
      type: String,
      enum: ["markdown", "plain", "richtext-json"],
      default: "markdown",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    notebook: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notebook",
      required: true,
      index: true,
    },
    folder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
    checklist: { type: [checklistItemSchema], default: [] },
    color: { type: String, default: null },
    coverImage: { type: String, default: null },
    reminderDate: { type: Date, default: null },
    isPinned: { type: Boolean, default: false },
    isFavorite: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    isLocked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    lastEditedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Text index powers "search by title/content".
noteSchema.index({ title: "text", content: "text" });
// Frequent listing query.
noteSchema.index({ owner: 1, notebook: 1, isDeleted: 1 });

module.exports = mongoose.model("Note", noteSchema);
