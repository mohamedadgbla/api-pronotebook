const router = require("express").Router();
const c = require("../controllers/note.controller");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const v = require("../validators/note.validator");

router.use(auth);

// Trash routes come before "/:id" so they are not swallowed by it.
router.get("/trash", c.trash);
router.delete("/trash/empty", c.emptyTrash);

router.post("/", validate(v.create), c.create);
router.get("/", validate(v.listQuery, "query"), c.list);
router.get("/:id", c.getOne);
router.patch("/:id", validate(v.update), c.update);
router.patch("/:id/move", validate(v.move), c.move);
router.post("/:id/duplicate", c.duplicate);
router.delete("/:id", c.remove); // soft delete
router.post("/:id/restore", c.restore);
router.delete("/:id/permanent", c.destroy);

module.exports = router;
