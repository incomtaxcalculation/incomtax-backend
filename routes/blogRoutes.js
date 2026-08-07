const router = require("express").Router();
const auth = require("../middleware/auth");
const {
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  checkSlug,
} = require("../controllers/blogController");

router.get("/", getBlogs);
router.get("/check-slug/:slug", checkSlug);
router.get("/:slug", getBlog);

router.post("/", auth, createBlog);
router.put("/:slug", auth, updateBlog);
router.delete("/:id", auth, deleteBlog);

module.exports = router;
