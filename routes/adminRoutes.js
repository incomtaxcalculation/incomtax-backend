const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const auth = require("../middleware/auth");
const {
  login,
  refreshToken,
  getAnalytics,
} = require("../controllers/adminController");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 5 : 999,
  message: { msg: "Too many login attempts, try again later" },
});

router.post("/login", loginLimiter, login);
router.post("/refresh-token", refreshToken);
router.get("/analytics", auth, getAnalytics);

module.exports = router;
