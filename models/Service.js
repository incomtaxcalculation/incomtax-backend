const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    short_description: { type: String, default: "" },
    long_description: { type: String, default: "" },
    feature_image: { type: String, default: null },
    feature_image_alt: { type: String, default: "" },
    icon: { type: String, default: "" },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    seo_title: { type: String, default: "" },
    seo_description: { type: String, default: "" },
    focus_keyword: { type: String, default: "" },
  },
  { timestamps: true },
);

serviceSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Service", serviceSchema);
