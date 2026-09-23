const router = require("express").Router();

router.use("/auth", require("./auth.routes"));
router.use("/users", require("./user.routes"));
router.use("/notebooks", require("./notebook.routes"));
router.use("/notes", require("./note.routes"));
router.use("/folders", require("./folder.routes"));
router.use("/tags", require("./tag.routes"));
router.use("/dashboard", require("./dashboard.routes"));

module.exports = router;
