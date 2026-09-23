const Note = require("../models/Note");
const Notebook = require("../models/Notebook");
const Folder = require("../models/Folder");
const User = require("../models/User");

// Aggregate counts for the logged-in user's dashboard.
const userDashboard = async (ownerId) => {
  const [
    totalNotes, totalNotebooks, totalFolders,
    favoriteNotes, pinnedNotes, archivedNotes, trashedNotes,
    recentNotes,
  ] = await Promise.all([
    Note.countDocuments({ owner: ownerId, isDeleted: false }),
    Notebook.countDocuments({ owner: ownerId, isDeleted: false }),
    Folder.countDocuments({ owner: ownerId }),
    Note.countDocuments({ owner: ownerId, isFavorite: true, isDeleted: false }),
    Note.countDocuments({ owner: ownerId, isPinned: true, isDeleted: false }),
    Note.countDocuments({ owner: ownerId, isArchived: true, isDeleted: false }),
    Note.countDocuments({ owner: ownerId, isDeleted: true }),
    Note.find({ owner: ownerId, isDeleted: false })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select("title updatedAt notebook")
      .populate("notebook", "title color"),
  ]);

  return {
    totals: { totalNotes, totalNotebooks, totalFolders },
    notes: { favoriteNotes, pinnedNotes, archivedNotes, trashedNotes },
    recentNotes,
  };
};

// Admin-wide statistics.
const adminDashboard = async () => {
  const [totalUsers, activeUsers, totalNotes, totalNotebooks] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ status: "active" }),
    Note.countDocuments(),
    Notebook.countDocuments(),
  ]);
  return { totalUsers, activeUsers, totalNotes, totalNotebooks };
};

module.exports = { userDashboard, adminDashboard };
