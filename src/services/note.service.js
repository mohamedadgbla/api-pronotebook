const Note = require("../models/Note");
const Notebook = require("../models/Notebook");
const ApiError = require("../utils/ApiError");
const { getPagination, buildPaginationMeta } = require("../utils/pagination");

const SORTS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  updated: { updatedAt: -1 },
  title: { title: 1 },
};

// Make sure the target notebook belongs to the user before attaching a note.
const assertNotebookOwned = async (ownerId, notebookId) => {
  const nb = await Notebook.findOne({ _id: notebookId, owner: ownerId, isDeleted: false });
  if (!nb) throw ApiError.badRequest("Notebook does not exist or is not yours");
};

const create = async (ownerId, data) => {
  await assertNotebookOwned(ownerId, data.notebook);
  return Note.create({ ...data, owner: ownerId, lastEditedBy: ownerId });
};

// The big listing/search/filter/pagination query.
const list = async (ownerId, q) => {
  const { page, limit, skip } = getPagination(q);

  const query = { owner: ownerId, isDeleted: false };
  if (q.notebook) query.notebook = q.notebook;
  if (q.folder) query.folder = q.folder;
  if (q.tag) query.tags = q.tag;

  if (q.filter === "favorite") query.isFavorite = true;
  else if (q.filter === "pinned") query.isPinned = true;
  else if (q.filter === "archived") query.isArchived = true;
  else query.isArchived = false; // default view hides archived

  if (q.search) query.$text = { $search: q.search };

  const sort = q.search
    ? { score: { $meta: "textScore" }, ...SORTS.updated }
    : SORTS[q.sort] || SORTS.updated;

  const projection = q.search ? { score: { $meta: "textScore" } } : {};

  const [items, total] = await Promise.all([
    Note.find(query, projection)
      .sort({ isPinned: -1, ...sort })
      .skip(skip)
      .limit(limit)
      .populate("tags", "name color")
      .populate("notebook", "title color"),
    Note.countDocuments(query),
  ]);

  return { items, pagination: buildPaginationMeta({ page, limit, total }) };
};

const getById = async (ownerId, id) => {
  const note = await Note.findOne({ _id: id, owner: ownerId, isDeleted: false })
    .populate("tags", "name color")
    .populate("notebook", "title color");
  if (!note) throw ApiError.notFound("Note not found");
  return note;
};

const update = async (ownerId, id, data) => {
  const note = await getById(ownerId, id);
  if (note.isLocked && !("isLocked" in data)) {
    throw ApiError.forbidden("Note is locked. Unlock it before editing.");
  }
  Object.assign(note, data, { lastEditedBy: ownerId });
  await note.save();
  return note;
};

const move = async (ownerId, id, { notebook, folder }) => {
  await assertNotebookOwned(ownerId, notebook);
  return update(ownerId, id, { notebook, folder: folder || null });
};

const duplicate = async (ownerId, id) => {
  const src = await getById(ownerId, id);
  return Note.create({
    title: `${src.title} (copy)`,
    content: src.content,
    contentFormat: src.contentFormat,
    owner: ownerId,
    notebook: src.notebook._id || src.notebook,
    folder: src.folder,
    tags: src.tags.map((t) => t._id || t),
    checklist: src.checklist,
    lastEditedBy: ownerId,
  });
};

// ----- trash / recovery -----
const softDelete = async (ownerId, id) => {
  const note = await Note.findOne({ _id: id, owner: ownerId, isDeleted: false });
  if (!note) throw ApiError.notFound("Note not found");
  note.isDeleted = true;
  note.deletedAt = new Date();
  await note.save();
  return note;
};

const listTrash = (ownerId) =>
  Note.find({ owner: ownerId, isDeleted: true }).sort({ deletedAt: -1 });

const restore = async (ownerId, id) => {
  const note = await Note.findOne({ _id: id, owner: ownerId, isDeleted: true });
  if (!note) throw ApiError.notFound("Note not found in trash");
  note.isDeleted = false;
  note.deletedAt = null;
  await note.save();
  return note;
};

const destroy = async (ownerId, id) => {
  const res = await Note.deleteOne({ _id: id, owner: ownerId });
  if (res.deletedCount === 0) throw ApiError.notFound("Note not found");
};

const emptyTrash = (ownerId) =>
  Note.deleteMany({ owner: ownerId, isDeleted: true });

module.exports = {
  create, list, getById, update, move, duplicate,
  softDelete, listTrash, restore, destroy, emptyTrash,
};
