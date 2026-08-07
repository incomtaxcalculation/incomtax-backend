require("dotenv").config({ quiet: true });

const connectDB = require("./config/mongoose");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

app.use("/uploads", express.static("uploads"));

/* ---------------- DB CONNECT ---------------- */
connectDB();

/* ---------------- ROUTES ---------------- */
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/blogs", require("./routes/blogRoutes"));
app.use("/api/services", require("./routes/serviceRoutes"));
app.use("/api/contacts", require("./routes/contactRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/videos", require("./routes/videoRoutes"));
app.use("/api/newsletter", require("./routes/newsletterRoutes"));

app.get("/", (req, res) => {
  res.send("API Running 🚀");
});

app.use((err, req, res, next) => {
  console.error("❌ Unhandled Server Error:", err.stack);
  res.status(500).json({
    msg: "Internal Server Error",
    error: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});