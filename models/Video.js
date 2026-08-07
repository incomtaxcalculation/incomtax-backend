const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    short_description: { type: String, default: "" },
    video_url: { type: String, default: "" },
    thumbnail: { type: String, default: null },
    thumbnail_alt: { type: String, default: "" },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
  },
  { timestamps: true },
);

videoSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Video", videoSchema);
