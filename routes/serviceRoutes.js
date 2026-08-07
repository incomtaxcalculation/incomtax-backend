const router = require("express").Router();
const auth = require("../middleware/auth");
const {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  checkSlug,
} = require("../controllers/serviceController");

router.get("/", getServices);
router.get("/check-slug/:slug", checkSlug);
router.get("/:slug", getService);

router.post("/", auth, createService);
router.put("/:slug", auth, updateService);
router.delete("/:id", auth, deleteService);

module.exports = router;
