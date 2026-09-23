const router = require("express").Router();
const c = require("../controllers/auth.controller");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const v = require("../validators/auth.validator");

router.post("/register", validate(v.register), c.register);
router.post("/login", validate(v.login), c.login);
router.post("/refresh", validate(v.refresh), c.refresh);
router.post("/logout", auth, c.logout);
router.get("/me", auth, c.me);
router.patch("/profile", auth, validate(v.updateProfile), c.updateProfile);
router.patch("/change-password", auth, validate(v.changePassword), c.changePassword);

module.exports = router;
