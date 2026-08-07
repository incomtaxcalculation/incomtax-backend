const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '') || req.cookies?.adminToken;

  console.log("Auth check - Authorization header:", authHeader ? "present" : "missing");
  console.log("Auth check - Cookie header:", req.headers.cookie ? "present" : "missing");
  console.log("Auth check - req.cookies:", req.cookies);
  console.log("Auth check - Token:", token ? "found" : "NOT RECEIVED");

  if (!token) {
    return res.status(401).json({ msg: "No token, access denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Auth success - Admin ID:", decoded.id);
    req.admin = decoded;
    next();
  } catch (err) {
    console.error("Auth failed - Error:", err.message);
    res.status(401).json({ msg: "Invalid token" });
  }
};
