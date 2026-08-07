const router = require("express").Router();
const auth = require("../middleware/auth");
const {
  getVideos,
  getVideo,
  checkTitle,
  createVideo,
  updateVideo,
  deleteVideo,
} = require("../controllers/videoController");

router.get("/", getVideos);
router.get("/check-title/:title", checkTitle);
router.get("/:id", getVideo);

router.post("/", auth, createVideo);
router.put("/:id", auth, updateVideo);
router.delete("/:id", auth, deleteVideo);

module.exports = router;
