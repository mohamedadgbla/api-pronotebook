const router = require("express").Router();
const c = require("../controllers/user.controller");
const auth = require("../middleware/auth");
const authorize = require("../middleware/role");

// Admin-only area.
router.use(auth, authorize("admin"));
router.get("/", c.list);
router.get("/:id", c.getOne);
router.patch("/:id/status", c.setStatus);
router.delete("/:id", c.remove);

module.exports = router;
