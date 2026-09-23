const Notebook = require("../models/Notebook");
const Note = require("../models/Note");
const ApiError = require("../utils/ApiError");

// Every query is scoped to the owner so users can never touch each other's data.
const create = (ownerId, data) => Notebook.create({ ...data, owner: ownerId });

const list = (ownerId, { includeArchived = false, trashed = false } = {}) => {
  const query = { owner: ownerId, isDeleted: trashed };
  if (!includeArchived && !trashed) query.isArchived = false;
  return Notebook.find(query).sort({ isPinned: -1, updatedAt: -1 });
};

const getById = async (ownerId, id) => {
  const notebook = await Notebook.findOne({ _id: id, owner: ownerId });
  if (!notebook) throw ApiError.notFound("Notebook not found");
  return notebook;
};

const update = async (ownerId, id, data) => {
  const notebook = await getById(ownerId, id);
  Object.assign(notebook, data);
  await notebook.save();
  return notebook;
};

// Soft delete: move to trash instead of removing. Notes go with it.
const softDelete = async (ownerId, id) => {
  const notebook = await getById(ownerId, id);
  notebook.isDeleted = true;
  notebook.deletedAt = new Date();
  await notebook.save();
  await Note.updateMany(
    { notebook: id, owner: ownerId, isDeleted: false },
    { isDeleted: true, deletedAt: new Date() }
  );
  return notebook;
};

const restore = async (ownerId, id) => {
  const notebook = await Notebook.findOne({ _id: id, owner: ownerId, isDeleted: true });
  if (!notebook) throw ApiError.notFound("Notebook not found in trash");
  notebook.isDeleted = false;
  notebook.deletedAt = null;
  await notebook.save();
  return notebook;
};

// Hard delete: gone for good, including its notes.
const destroy = async (ownerId, id) => {
  const notebook = await Notebook.findOne({ _id: id, owner: ownerId });
  if (!notebook) throw ApiError.notFound("Notebook not found");
  await Note.deleteMany({ notebook: id, owner: ownerId });
  await notebook.deleteOne();
};

const duplicate = async (ownerId, id) => {
  const source = await getById(ownerId, id);
  const copy = await Notebook.create({
    title: `${source.title} (copy)`,
    description: source.description,
    color: source.color,
    icon: source.icon,
    visibility: "private",
    owner: ownerId,
  });

  const notes = await Note.find({ notebook: id, owner: ownerId, isDeleted: false });
  await Promise.all(
    notes.map((n) =>
      Note.create({
        title: n.title,
        content: n.content,
        contentFormat: n.contentFormat,
        owner: ownerId,
        notebook: copy._id,
        tags: n.tags,
        checklist: n.checklist,
      })
    )
  );
  return copy;
};

const stats = async (ownerId, id) => {
  await getById(ownerId, id);
  const [total, archived, favorite] = await Promise.all([
    Note.countDocuments({ notebook: id, owner: ownerId, isDeleted: false }),
    Note.countDocuments({ notebook: id, owner: ownerId, isArchived: true, isDeleted: false }),
    Note.countDocuments({ notebook: id, owner: ownerId, isFavorite: true, isDeleted: false }),
  ]);
  return { totalNotes: total, archivedNotes: archived, favoriteNotes: favorite };
};

module.exports = {
  create, list, getById, update,
  softDelete, restore, destroy, duplicate, stats,
};
