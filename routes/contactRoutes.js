const router = require("express").Router();
const auth = require("../middleware/auth");
const {
  getContacts,
  createContact,
  deleteContact,
} = require("../controllers/contactController");

// Public
router.post("/", createContact);

// Admin (protected)
router.get("/", auth, getContacts);
router.delete("/:id", auth, deleteContact);

module.exports = router;
