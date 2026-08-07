const router = require("express").Router();
const auth = require("../middleware/auth");
const {
  subscribe,
  getSubscribers,
  deleteSubscriber,
} = require("../controllers/newsletterController");

// Public
router.post("/", subscribe);

// Admin (protected)
router.get("/", auth, getSubscribers);
router.delete("/:id", auth, deleteSubscriber);

module.exports = router;
