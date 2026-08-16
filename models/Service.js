const mongoose = require("mongoose");

const subDoc = { _id: false };

const textItemSchema = new mongoose.Schema(
  {
    text: { type: String, default: "" },
  },
  subDoc,
);

const includedServiceSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    icon: { type: String, default: "" },
  },
  subDoc,
);

const processStepSchema = new mongoose.Schema(
  {
    step: { type: Number, default: 1 },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    icon: { type: String, default: "" },
  },
  subDoc,
);

const documentRequirementSchema = new mongoose.Schema(
  {
    applicantType: { type: String, default: "" },
    icon: { type: String, default: "" },
    documents: { type: [String], default: [] },
  },
  subDoc,
);

const timelineMetricSchema = new mongoose.Schema(
  {
    label: { type: String, default: "" },
    value: { type: String, default: "" },
    icon: { type: String, default: "" },
  },
  subDoc,
);

const whyChooseFeatureSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    icon: { type: String, default: "" },
  },
  subDoc,
);

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    designation: { type: String, default: "" },
    content: { type: String, default: "" },
    avatar: { type: String, default: "" },
  },
  subDoc,
);

const serviceSchema = new mongoose.Schema(
  {
    // Basics
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    short_description: { type: String, default: "" },
    icon: { type: String, default: "" },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    featureImage: { type: String, default: null },
    featureImageAlt: { type: String, default: "" },
    author: { type: String, default: "" },

    // SEO
    seo_title: { type: String, default: "" },
    seo_description: { type: String, default: "" },
    focus_keyword: { type: String, default: "" },

    // Hero
    badge: { type: String, default: "" },
    heroDescription: { type: String, default: "" },
    primaryButton: { type: String, default: "" },
    secondaryButton: { type: String, default: "" },
    trustPoints: { type: [String], default: [] },

    // Struggle / solution
    struggleHeadingBefore: { type: String, default: "" },
    struggleHeadingHighlight: { type: String, default: "" },
    solutionIntro: { type: String, default: "" },
    commonProblems: { type: [textItemSchema], default: [] },
    solutions: { type: [textItemSchema], default: [] },

    // Included services
    servicesHeadingBefore: { type: String, default: "" },
    servicesHeadingHighlight: { type: String, default: "" },
    servicesHeadingAfter: { type: String, default: "" },
    includedServices: { type: [includedServiceSchema], default: [] },

    // Process
    processHeadingBefore: { type: String, default: "" },
    processHeadingHighlight: { type: String, default: "" },
    processSteps: { type: [processStepSchema], default: [] },

    // Required documents
    requiredDocsTitle: { type: String, default: "" },
    documentRequirements: { type: [documentRequirementSchema], default: [] },

    // Timeline
    timeRequiredTitle: { type: String, default: "" },
    fastProcessingText: { type: String, default: "" },
    timelineMetrics: { type: [timelineMetricSchema], default: [] },

    // Why choose us
    whyChooseHeadingBefore: { type: String, default: "" },
    whyChooseHeadingHighlight: { type: String, default: "" },
    whyChooseFeatures: { type: [whyChooseFeatureSchema], default: [] },

    // Testimonials
    testimonialsTitle: { type: String, default: "" },
    testimonials: { type: [testimonialSchema], default: [] },

    // CTA
    ctaTitle: { type: String, default: "" },
    ctaHighlight: { type: String, default: "" },
    ctaDescription: { type: String, default: "" },
    ctaApplyButton: { type: String, default: "" },
    ctaPhone: { type: String, default: "" },
    ctaWhatsapp: { type: String, default: "" },
    ctaCallButton: { type: String, default: "" },
    ctaWhatsappButton: { type: String, default: "" },
  },
  { timestamps: true },
);

serviceSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Service", serviceSchema);
