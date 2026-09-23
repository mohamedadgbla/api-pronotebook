const router = require("express").Router();
const c = require("../controllers/folder.controller");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const v = require("../validators/folder.validator");

router.use(auth);
router.post("/", validate(v.create), c.create);
router.get("/", c.list);
router.patch("/:id", validate(v.update), c.update);
router.delete("/:id", c.remove);

module.exports = router;
