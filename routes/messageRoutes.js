const router = require("express").Router();
const auth = require("../middleware/auth");
const {
  getMessages,
  createMessage,
  markAsRead,
  deleteMessage,
} = require("../controllers/messageController");

router.post("/", createMessage);
router.get("/", auth, getMessages);
router.patch("/:id/read", auth, markAsRead);
router.delete("/:id", auth, deleteMessage);

module.exports = router;