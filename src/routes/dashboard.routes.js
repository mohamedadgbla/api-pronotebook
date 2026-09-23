const router = require("express").Router();
const c = require("../controllers/dashboard.controller");
const auth = require("../middleware/auth");
const authorize = require("../middleware/role");

router.get("/", auth, c.userDashboard);
router.get("/admin", auth, authorize("admin"), c.adminDashboard);

module.exports = router;
