const Service = require("../models/Service");

/* ------------------------------------------------------------------ */
/* Normalizers                                                         */
/* ------------------------------------------------------------------ */

const str = (v) => (v === undefined || v === null ? "" : String(v));

// ["a", "b"] — also tolerates [{ text: "a" }] and a newline/comma separated string
const toStringList = (value) => {
  if (typeof value === "string") {
    return value
      .split(/\r?\n|,/)
      .map((v) => v.trim())
      .filter(Boolean);
  }
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (item && typeof item === "object" ? str(item.text ?? item.value) : str(item)))
    .map((v) => v.trim())
    .filter(Boolean);
};

// [{ text }] — also tolerates ["a", "b"]
const toTextItems = (value) =>
  toStringList(value).map((text) => ({ text }));

// Generic object-list normalizer: keeps only the known keys of a sub-document
const toObjectList = (value, mapFn) => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && typeof item === "object")
    .map(mapFn);
};

const toIncludedServices = (value) =>
  toObjectList(value, (item) => ({
    title: str(item.title),
    description: str(item.description),
    icon: str(item.icon),
  }));

const toProcessSteps = (value) =>
  toObjectList(value, (item, index) => ({
    step: Number.isFinite(Number(item.step)) && item.step !== "" ? Number(item.step) : index + 1,
    title: str(item.title),
    description: str(item.description),
    icon: str(item.icon),
  }));

const toDocumentRequirements = (value) =>
  toObjectList(value, (item) => ({
    applicantType: str(item.applicantType),
    icon: str(item.icon),
    documents: toStringList(item.documents),
  }));

const toTimelineMetrics = (value) =>
  toObjectList(value, (item) => ({
    label: str(item.label),
    value: str(item.value),
    icon: str(item.icon),
  }));

const toWhyChooseFeatures = (value) =>
  toObjectList(value, (item) => ({
    title: str(item.title),
    description: str(item.description),
    icon: str(item.icon),
  }));

const toTestimonials = (value) =>
  toObjectList(value, (item) => ({
    name: str(item.name),
    designation: str(item.designation),
    content: str(item.content),
    avatar: str(item.avatar),
  }));

/* ------------------------------------------------------------------ */
/* Field maps                                                          */
/* ------------------------------------------------------------------ */

// Plain string fields, applied as-is. `featureImage` is handled separately.
const STRING_FIELDS = [
  "short_description",
  "icon",
  "featureImageAlt",
  "author",
  "seo_title",
  "seo_description",
  "focus_keyword",
  "badge",
  "heroDescription",
  "primaryButton",
  "secondaryButton",
  "struggleHeadingBefore",
  "struggleHeadingHighlight",
  "solutionIntro",
  "servicesHeadingBefore",
  "servicesHeadingHighlight",
  "servicesHeadingAfter",
  "processHeadingBefore",
  "processHeadingHighlight",
  "requiredDocsTitle",
  "timeRequiredTitle",
  "fastProcessingText",
  "whyChooseHeadingBefore",
  "whyChooseHeadingHighlight",
  "testimonialsTitle",
  "ctaTitle",
  "ctaHighlight",
  "ctaDescription",
  "ctaApplyButton",
  "ctaPhone",
  "ctaWhatsapp",
  "ctaCallButton",
  "ctaWhatsappButton",
];

const ARRAY_FIELDS = {
  trustPoints: toStringList,
  commonProblems: toTextItems,
  solutions: toTextItems,
  includedServices: toIncludedServices,
  processSteps: toProcessSteps,
  documentRequirements: toDocumentRequirements,
  timelineMetrics: toTimelineMetrics,
  whyChooseFeatures: toWhyChooseFeatures,
  testimonials: toTestimonials,
};

const has = (body, key) => Object.prototype.hasOwnProperty.call(body, key);

// Builds the set of fields to write. On create every field gets a value; on
// update only the keys actually present in the body are touched.
const buildPayload = (body, { partial }) => {
  const data = {};

  for (const key of STRING_FIELDS) {
    if (!partial || has(body, key)) data[key] = str(body[key]);
  }

  for (const [key, normalize] of Object.entries(ARRAY_FIELDS)) {
    if (!partial || has(body, key)) data[key] = normalize(body[key]);
  }

  if (!partial || has(body, "status")) {
    data.status = body.status === "inactive" ? "inactive" : "active";
  }

  return data;
};

const serialize = (service) => {
  const obj = service.toObject();
  return {
    ...obj,
    id: service._id,
    featureImage: obj.featureImage || "",
    created_at: service.createdAt,
    updated_at: service.updatedAt,
  };
};

/* ------------------------------------------------------------------ */
/* Handlers                                                            */
/* ------------------------------------------------------------------ */

exports.getServices = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "createdAt",
      order = "DESC",
      search = "",
      from_date = "",
      to_date = "",
      status = "",
    } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        { short_description: { $regex: search, $options: "i" } },
      ];
    }
    if (from_date || to_date) {
      filter.createdAt = {};
      if (from_date) filter.createdAt.$gte = new Date(from_date);
      if (to_date) {
        const end = new Date(to_date);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }
    if (status && status !== "all") {
      filter.status = status;
    }

    const sortOrder = order.toUpperCase() === "ASC" ? 1 : -1;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [services, total] = await Promise.all([
      Service.find(filter)
        .sort({ [sort]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit)),
      Service.countDocuments(filter),
    ]);

    res.json({ services: services.map(serialize), total });
  } catch (err) {
    console.error("Get services error:", err);
    res.status(500).json({ msg: "Failed to fetch services", error: err.message });
  }
};

exports.getService = async (req, res) => {
  try {
    const service = await Service.findOne({ slug: req.params.slug });
    if (!service) return res.status(404).json({ msg: "Service not found" });

    res.json({ service: serialize(service) });
  } catch (err) {
    console.error("Get service error:", err);
    res.status(500).json({ msg: "Failed to fetch service", error: err.message });
  }
};

exports.checkSlug = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) return res.status(400).json({ exists: false });

    const existing = await Service.findOne({ slug });
    res.json({ exists: !!existing });
  } catch (err) {
    console.error("Check slug error:", err);
    res.status(500).json({ exists: false });
  }
};

exports.createService = async (req, res) => {
  try {
    const { title, slug, featureImage } = req.body;

    if (!title || !slug) {
      return res.status(400).json({ msg: "Title and slug are required" });
    }

    const service = await Service.create({
      ...buildPayload(req.body, { partial: false }),
      title,
      slug,
      featureImage: featureImage || null,
    });

    res.json({ msg: "Service Created Successfully", id: service._id });
  } catch (err) {
    console.error("Create service error:", err);
    if (err.code === 11000) {
      return res.status(400).json({ msg: "Slug already exists" });
    }
    res.status(500).json({ msg: "Failed to create", error: err.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const { slug: oldSlug } = req.params;
    const { title, slug: newSlug, featureImage, existingFeatureImage } = req.body;

    const service = await Service.findOne({ slug: oldSlug });
    if (!service) return res.status(404).json({ msg: "Service not found" });

    const updates = buildPayload(req.body, { partial: true });
    for (const [key, value] of Object.entries(updates)) {
      service[key] = value;
    }

    if (title) service.title = title;
    if (newSlug) service.slug = newSlug;

    if (featureImage) {
      service.featureImage = featureImage;
    } else if (existingFeatureImage === "") {
      service.featureImage = null;
    }

    await service.save();
    res.json({ msg: "Service Updated Successfully" });
  } catch (err) {
    console.error("Update service error:", err);
    if (err.code === 11000) {
      return res.status(400).json({ msg: "Slug already exists" });
    }
    res.status(500).json({ msg: "Failed to update", error: err.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByIdAndDelete(id);
    if (!service) return res.status(404).json({ msg: "Service not found" });

    res.json({ msg: "Service deleted successfully" });
  } catch (err) {
    console.error("Delete service error:", err);
    res.status(500).json({ msg: "Failed to delete service", error: err.message });
  }
};
