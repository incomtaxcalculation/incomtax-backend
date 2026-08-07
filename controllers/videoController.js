const Video = require("../models/Video");

exports.getVideos = async (req, res) => {
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

    const [videos, total] = await Promise.all([
      Video.find(filter)
        .sort({ [sort]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit)),
      Video.countDocuments(filter),
    ]);

    const mapped = videos.map((v) => ({
      ...v.toObject(),
      id: v._id,
      thumbnail: v.thumbnail || "",
      thumbnailAlt: v.thumbnail_alt || "",
      videoUrl: v.video_url || "",
      created_at: v.createdAt,
      updated_at: v.updatedAt,
    }));

    res.json({ videos: mapped, total });
  } catch (err) {
    console.error("Get videos error:", err);
    res.status(500).json({ msg: "Failed to fetch videos", error: err.message });
  }
};

exports.getVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ msg: "Video not found" });

    res.json({
      video: {
        ...video.toObject(),
        id: video._id,
        thumbnail: video.thumbnail || "",
        thumbnailAlt: video.thumbnail_alt || "",
        videoUrl: video.video_url || "",
        created_at: video.createdAt,
        updated_at: video.updatedAt,
      },
    });
  } catch (err) {
    console.error("Get video error:", err);
    res.status(500).json({ msg: "Failed to fetch video", error: err.message });
  }
};

exports.checkTitle = async (req, res) => {
  try {
    const { title } = req.params;
    if (!title) return res.status(400).json({ exists: false });

    const existing = await Video.findOne({ title });
    res.json({ exists: !!existing });
  } catch (err) {
    console.error("Check title error:", err);
    res.status(500).json({ exists: false });
  }
};

exports.createVideo = async (req, res) => {
  try {
    const { title, short_description, status, thumbnailAlt, videoUrl, thumbnail } = req.body;
    const finalStatus =
      status === "published" ? "published" : status === "archived" ? "archived" : "draft";

    const video = await Video.create({
      title,
      short_description: short_description || "",
      thumbnail: thumbnail || null,
      thumbnail_alt: thumbnailAlt || "",
      video_url: videoUrl || "",
      status: finalStatus,
    });

    console.log("✅ Video Created:", video._id);
    res.json({ msg: "Video Created Successfully", id: video._id });
  } catch (err) {
    console.error("Create video error:", err);
    res.status(500).json({ msg: "Failed to create video", error: err.message });
  }
};

exports.updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, short_description, status, thumbnailAlt, videoUrl, thumbnail, existingThumbnail } = req.body;

    const video = await Video.findById(id);
    if (!video) return res.status(404).json({ msg: "Video not found" });

    let thumbnailUrl = video.thumbnail;
    if (thumbnail) {
      thumbnailUrl = thumbnail;
    } else if (existingThumbnail === "") {
      thumbnailUrl = null;
    }

    video.title = title || video.title;
    video.short_description = short_description ?? video.short_description;
    video.thumbnail = thumbnailUrl;
    video.thumbnail_alt = thumbnailAlt ?? video.thumbnail_alt;
    video.video_url = videoUrl ?? video.video_url;
    video.status = status
      ? status === "published"
        ? "published"
        : status === "archived"
          ? "archived"
          : "draft"
      : video.status;

    await video.save();
    console.log("✅ Video Updated:", id);
    res.json({ msg: "Video Updated Successfully" });
  } catch (err) {
    console.error("Update video error:", err);
    res.status(500).json({ msg: "Failed to update", error: err.message });
  }
};

exports.deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Video.findByIdAndDelete(id);
    if (!video) return res.status(404).json({ msg: "Video not found" });

    console.log("✅ Video Deleted:", id);
    res.json({ msg: "Video Deleted" });
  } catch (err) {
    console.error("Delete video error:", err);
    res.status(500).json({ msg: "Failed to delete video", error: err.message });
  }
};
