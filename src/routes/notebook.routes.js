const router = require("express").Router();
const c = require("../controllers/notebook.controller");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const v = require("../validators/notebook.validator");

router.use(auth); // everything below requires login

router.post("/", validate(v.create), c.create);
router.get("/", c.list);
router.get("/:id", c.getOne);
router.get("/:id/stats", c.stats);
router.patch("/:id", validate(v.update), c.update);
router.post("/:id/duplicate", c.duplicate);
router.delete("/:id", c.remove); // soft delete -> trash
router.post("/:id/restore", c.restore);
router.delete("/:id/permanent", c.destroy);

module.exports = router;
