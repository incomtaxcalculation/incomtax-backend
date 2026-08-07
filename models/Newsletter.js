const mongoose = require("mongoose");

const newsletterSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    ip: { type: String },
    deviceType: { type: String },
    browser: { type: String },
    os: { type: String },
    location: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Newsletter", newsletterSchema);
