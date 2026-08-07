const Blog = require("../models/Blog");
const Newsletter = require("../models/Newsletter");
const { sendMail } = require("../utils/sendMail");
const { newBlogNotification } = require("../utils/email-templates");

exports.getBlogs = async (req, res) => {
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
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [blogs, totalBlogs, allTotalBlogs, allPublishedBlogs, allDraftBlogs] = await Promise.all([
      Blog.find(filter)
        .sort({ [sort]: sortOrder })
        .skip(skip)
        .limit(limitNum),
      Blog.countDocuments(filter),
      Blog.countDocuments({}),
      Blog.countDocuments({ status: "published" }),
      Blog.countDocuments({ status: "draft" }),
    ]);

    const mapped = blogs.map((b) => ({
      ...b.toObject(),
      id: b._id,
      coverImage: b.image || "",
      coverImageAlt: b.image_alt || "",
      seo_title: b.seo_title || "",
      seo_description: b.seo_description || "",
      focus_keyword: b.focus_keyword || "",
      schemaMarkup: b.schemaMarkup || "",
      created_at: b.createdAt,
      updated_at: b.updatedAt,
    }));

    res.json({
      blogs: mapped,
      totalBlogs,
      allTotalBlogs,
      allPublishedBlogs,
      allDraftBlogs,
      currentPage: pageNum,
      totalPages: Math.ceil(totalBlogs / limitNum) || 1,
      limit: limitNum,
    });
  } catch (err) {
    console.error("Get blogs error:", err);
    res.status(500).json({ msg: "Failed to fetch blogs", error: err.message });
  }
};

exports.getBlog = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) return res.status(404).json({ msg: "Blog not found" });

    res.json({
      blog: {
        ...blog.toObject(),
        id: blog._id,
        coverImage: blog.image || "",
        coverImageAlt: blog.image_alt || "",
        seo_title: blog.seo_title || "",
        seo_description: blog.seo_description || "",
        focus_keyword: blog.focus_keyword || "",
        schemaMarkup: blog.schemaMarkup || "",
        created_at: blog.createdAt,
        updated_at: blog.updatedAt,
      },
    });
  } catch (err) {
    console.error("Get blog error:", err);
    res.status(500).json({ msg: "Failed to fetch blog", error: err.message });
  }
};

exports.checkSlug = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) return res.status(400).json({ exists: false });

    const existing = await Blog.findOne({ slug });
    res.json({ exists: !!existing });
  } catch (err) {
    console.error("Check slug error:", err);
    res.status(500).json({ exists: false });
  }
};

exports.createBlog = async (req, res) => {
  try {
    const { title, slug, short_description, description, details, status, coverImageAlt, coverImage, seo_title, seo_description, focus_keyword, schemaMarkup } = req.body;
    const finalShortDesc = short_description || description;
    const finalDetails = details || description;
    const finalStatus = status === "published" ? "published" : "draft";

    const blog = await Blog.create({
      title,
      slug,
      image: coverImage || null,
      image_alt: coverImageAlt || "",
      short_description: finalShortDesc,
      details: finalDetails,
      seo_title: seo_title || "",
      seo_description: seo_description || "",
      focus_keyword: focus_keyword || "",
      schemaMarkup: schemaMarkup || "",
      status: finalStatus,
    });

    console.log("✅ Blog Created:", blog._id);

    if (finalStatus === "published") {
      try {
        const subscribers = await Newsletter.find({});
        if (subscribers.length > 0) {
          const emails = subscribers.map((s) => s.email);
          const html = newBlogNotification({
            blogTitle: blog.title,
            blogSlug: blog.slug,
            shortDescription: blog.short_description,
          });

          await sendMail({
            to: emails,
            subject: `New Blog: ${blog.title}`,
            html,
          });

          console.log(`📧 Sent notification to ${emails.length} subscribers`);
          blog.emailSent = true;
          await blog.save();
        }
      } catch (emailErr) {
        console.error("Failed to send blog notification emails:", emailErr.message);
      }
    }

    res.json({ msg: "Blog Created Successfully", slug: blog.slug });
  } catch (err) {
    console.error("Create blog error:", err);
    if (err.code === 11000) {
      return res.status(400).json({ msg: "Slug already exists" });
    }
    res.status(500).json({ msg: "Failed to create blog", error: err.message });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const { slug: oldSlug } = req.params;
    const { title, slug: newSlug, short_description, description, details, status, coverImageAlt, coverImage, existingImage, seo_title, seo_description, focus_keyword, schemaMarkup } = req.body;

    const blog = await Blog.findOne({ slug: oldSlug });
    if (!blog) return res.status(404).json({ msg: "Blog not found" });

    let imageUrl = blog.image;
    if (coverImage) {
      imageUrl = coverImage;
    } else if (existingImage === "") {
      imageUrl = null;
    }

    blog.title = title || blog.title;
    blog.slug = newSlug || oldSlug;
    blog.image = imageUrl;
    blog.image_alt = coverImageAlt ?? blog.image_alt;
    blog.short_description = short_description ?? blog.short_description;
    blog.details = details ?? description ?? blog.details;
    blog.seo_title = seo_title ?? blog.seo_title;
    blog.seo_description = seo_description ?? blog.seo_description;
    blog.focus_keyword = focus_keyword ?? blog.focus_keyword;
    blog.schemaMarkup = schemaMarkup ?? blog.schemaMarkup;
    blog.status = status
      ? status === "published"
        ? "published"
        : "draft"
      : blog.status;

    if (!blog.emailSent && blog.isModified("status") && blog.status === "published") {
      try {
        const subscribers = await Newsletter.find({});
        if (subscribers.length > 0) {
          const emails = subscribers.map((s) => s.email);
          const html = newBlogNotification({
            blogTitle: blog.title,
            blogSlug: blog.slug,
            shortDescription: blog.short_description,
          });

          await sendMail({
            to: emails,
            subject: `New Blog: ${blog.title}`,
            html,
          });

          console.log(`📧 Sent notification to ${emails.length} subscribers`);
          blog.emailSent = true;
          await blog.save();
        }
      } catch (emailErr) {
        console.error("Failed to send blog notification emails:", emailErr.message);
      }
    }
    
    

    await blog.save();
    console.log("✅ Blog Updated:", blog._id);
    res.json({ msg: "Blog Updated Successfully" });
  } catch (err) {
    console.error("Update blog error:", err);
    if (err.code === 11000) {
      return res.status(400).json({ msg: "Slug already exists" });
    }
    res.status(500).json({ msg: "Failed to update", error: err.message });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) return res.status(404).json({ msg: "Blog not found" });

    console.log("✅ Blog Deleted:", id);
    res.json({ msg: "Blog Deleted" });
  } catch (err) {
    console.error("Delete blog error:", err);
    res.status(500).json({ msg: "Failed to delete blog", error: err.message });
  }
};
