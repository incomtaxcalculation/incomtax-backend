const Service = require("../models/Service");

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

    const mapped = services.map((s) => ({
      ...s.toObject(),
      id: s._id,
      featureImage: s.feature_image || "",
      featureImageAlt: s.feature_image_alt || "",
      icon: s.icon || "",
      seo_title: s.seo_title || "",
      seo_description: s.seo_description || "",
      focus_keyword: s.focus_keyword || "",
      created_at: s.createdAt,
      updated_at: s.updatedAt,
    }));

    res.json({ services: mapped, total });
  } catch (err) {
    console.error("Get services error:", err);
    res.status(500).json({ msg: "Failed to fetch services", error: err.message });
  }
};

exports.getService = async (req, res) => {
  try {
    const service = await Service.findOne({ slug: req.params.slug });
    if (!service) return res.status(404).json({ msg: "Service not found" });

    res.json({
      service: {
        ...service.toObject(),
        id: service._id,
        featureImage: service.feature_image || "",
        featureImageAlt: service.feature_image_alt || "",
        icon: service.icon || "",
        seo_title: service.seo_title || "",
        seo_description: service.seo_description || "",
        focus_keyword: service.focus_keyword || "",
        created_at: service.createdAt,
        updated_at: service.updatedAt,
      },
    });
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
    const { title, slug, short_description, long_description, featureImageAlt, status, featureImage, icon, seo_title, seo_description, focus_keyword } = req.body;

    const service = await Service.create({
      title,
      slug,
      short_description: short_description || "",
      long_description: long_description || "",
      feature_image: featureImage || null,
      feature_image_alt: featureImageAlt || "",
      icon: icon || "",
      status: status || "active",
      seo_title: seo_title || "",
      seo_description: seo_description || "",
      focus_keyword: focus_keyword || "",
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
    const { title, slug: newSlug, short_description, long_description, featureImageAlt, status, featureImage, existingFeatureImage, icon, seo_title, seo_description, focus_keyword } = req.body;

    const service = await Service.findOne({ slug: oldSlug });
    if (!service) return res.status(404).json({ msg: "Service not found" });

    let featureImageUrl = service.feature_image;
    if (featureImage) {
      featureImageUrl = featureImage;
    } else if (existingFeatureImage === "") {
      featureImageUrl = null;
    }

    service.title = title || service.title;
    service.slug = newSlug || oldSlug;
    service.short_description = short_description ?? service.short_description;
    service.long_description = long_description ?? service.long_description;
    service.feature_image = featureImageUrl;
    service.feature_image_alt = featureImageAlt ?? service.feature_image_alt;
    service.icon = icon ?? service.icon;
    service.status = status ?? service.status;
    service.seo_title = seo_title ?? service.seo_title;
    service.seo_description = seo_description ?? service.seo_description;
    service.focus_keyword = focus_keyword ?? service.focus_keyword;

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
