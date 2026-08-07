require("dotenv").config({ quiet: true });
const connectDB = require("./config/mongoose");
const Admin = require("./models/Admin");
const Service = require("./models/Service");
const bcrypt = require("bcryptjs");

const INCOME_TAX_REGISTRATION_SLUG = "tax-registration";

const seed = async () => {
  await connectDB();

  const existing = await Admin.findOne({ email: "admin@example.com" });
  if (!existing) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await Admin.create({
      username: "admin",
      email: "admin@example.com",
      password: hashedPassword,
    });
    console.log("✅ Admin seeded: admin@example.com / admin123");
  } else {
    console.log("✅ Admin already exists, skipping admin seed.");
  }

  const incomeTaxService = await Service.findOne({
    slug: INCOME_TAX_REGISTRATION_SLUG,
  });
  if (!incomeTaxService) {
    await Service.create({
      title: "Income Tax Registration in Pakistan",
      slug: INCOME_TAX_REGISTRATION_SLUG,
      short_description:
        "Get your NTN registered with FBR quickly and hassle-free. We handle the entire income tax registration process for individuals, freelancers, and businesses.",
      long_description: "",
      icon: "receipt-text",
      status: "active",
      seo_title: "Income Tax Registration in Pakistan | NTN Registration",
      seo_description:
        "Professional income tax and NTN registration services in Pakistan. FBR compliant, fast processing for individuals, freelancers, and businesses.",
      focus_keyword: "income tax registration pakistan",
    });
    console.log("✅ Income Tax Registration service seeded.");
  } else {
    console.log("✅ Income Tax Registration service already exists.");
  }

  process.exit(0);
};

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
