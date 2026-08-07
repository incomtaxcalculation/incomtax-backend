const router = require("express").Router();

router.post("/", (req, res) => {
  res.status(400).json({ error: "Uploads are handled by the client-side /api/upload route" });
});

module.exports = router;
