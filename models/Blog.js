const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    image: { type: String, default: null },
    image_alt: { type: String, default: "" },
    short_description: { type: String, default: "" },
    details: { type: String, default: "" },
    emailSent: { type: Boolean, default: false },
    seo_title: { type: String, default: "" },
    seo_description: { type: String, default: "" },
    focus_keyword: { type: String, default: "" },
    schemaMarkup: { type: String, default: "" },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
  },
  { timestamps: true },
);

blogSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Blog", blogSchema);
