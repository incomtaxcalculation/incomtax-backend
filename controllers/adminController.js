const Admin = require("../models/Admin");
const Blog = require("../models/Blog");
const Service = require("../models/Service");
const Video = require("../models/Video");
const Message = require("../models/Message");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const { generateToken, generateRefreshToken } = require("../config/jwt");

const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

exports.login = [
  ...loginValidation,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const admin = await Admin.findOne({ email });
      if (!admin) {
        return res.status(400).json({ msg: "Invalid email or password" });
      }

      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Invalid email or password" });
      }

      const token = generateToken(admin._id);
      const refreshToken = generateRefreshToken(admin._id);

      res.cookie("adminToken", token, {
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        msg: "Login successful",
        token,
        refreshToken,
        admin: { id: admin._id, email: admin.email },
      });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ msg: "Server error" });
    }
  },
];

exports.refreshToken = (req, res) => {
  const refreshToken = req.body?.refreshToken || req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ msg: "No refresh token provided" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const newToken = generateToken(decoded.id);
    const newRefreshToken = generateRefreshToken(decoded.id);

res.cookie("adminToken", newToken, {
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: process.env.NODE_ENV === "production",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ token: newToken, refreshToken: newRefreshToken });
  } catch (err) {
    res.status(401).json({ msg: "Invalid refresh token" });
  }
};

exports.getAnalytics = async (req, res) => {
  const timeRange = req.query.range || "daily";

  try {
    let dateFilter = {};
    const now = new Date();

    switch (timeRange) {
      case "daily":
        dateFilter = { createdAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) } };
        break;
      case "weekly":
        dateFilter = { createdAt: { $gte: new Date(now - 12 * 7 * 24 * 60 * 60 * 1000) } };
        break;
      case "monthly":
        dateFilter = { createdAt: { $gte: new Date(now - 6 * 30 * 24 * 60 * 60 * 1000) } };
        break;
      default:
        dateFilter = { createdAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) } };
    }

    const [
      publishedBlogs,
      draftBlogs,
      publishedServices,
      draftServices,
      publishedVideos,
      draftVideos,
      totalServices,
      totalVideos,
      totalMessages,
      unreadMessages,
      recentBlogs,
    ] = await Promise.all([
      Blog.countDocuments({ status: "published" }),
      Blog.countDocuments({ status: "draft" }),
      Service.countDocuments({ status: "active" }),
      Service.countDocuments({ status: "inactive" }),
      Video.countDocuments({ status: "published" }),
      Video.countDocuments({ status: "draft" }),
      Service.countDocuments(),
      Video.countDocuments(),
      Message.countDocuments(),
      Message.countDocuments({ isRead: false }),
      Blog.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title slug status createdAt")
        .lean()
        .then((blogs) =>
          blogs.map((b) => ({
            id: b._id.toString(),
            title: b.title,
            slug: b.slug,
            status: b.status,
            created_at: b.createdAt,
          })),
        ),
    ]);

    const chartBlogs = await Blog.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { label: "$_id", count: 1, _id: 0 } },
    ]);

    res.json({
      stats: {
        blogs: {
          published: publishedBlogs,
          draft: draftBlogs,
          total: publishedBlogs + draftBlogs,
        },
        services: {
          published: publishedServices,
          draft: draftServices,
          total: totalServices,
        },
        videos: {
          published: publishedVideos,
          draft: draftVideos,
          total: totalVideos,
        },
        messages: {
          total: totalMessages,
          unread: unreadMessages,
        },
      },
      chartData: chartBlogs,
      recentBlogs,
    });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
