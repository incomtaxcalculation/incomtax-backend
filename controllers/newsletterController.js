const net = require("net");
const Newsletter = require("../models/Newsletter");
const { sendMail } = require("../utils/sendMail");

function parseUserAgent(userAgent = "") {
  let deviceType = "Desktop";
  let browser = "Unknown";
  let os = "Unknown";

  const ua = userAgent.toLowerCase();

  if (/mobile|android|iphone|ipod|blackberry|windows phone/i.test(ua)) {
    deviceType = "Mobile";
  } else if (/tablet|ipad|playbook|silk/i.test(ua)) {
    deviceType = "Tablet";
  }

  if (/chrome/i.test(ua) && !/edge|opr|vivaldi/i.test(ua)) browser = "Chrome";
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";
  else if (/firefox/i.test(ua)) browser = "Firefox";
  else if (/edge/i.test(ua)) browser = "Edge";
  else if (/opr|opera/i.test(ua)) browser = "Opera";

  if (/windows/i.test(ua)) os = "Windows";
  else if (/mac/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua)) os = "Linux";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ios/i.test(ua)) os = "iOS";

  return { deviceType, browser, os };
}

async function getLocationFromIp(ip) {
  if (!ip || ip === "127.0.0.1" || ip === "::1") return null;
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city`);
    const data = await res.json();
    if (data.status === "success" && data.country) {
      return data.city ? `${data.city}, ${data.country}` : data.country;
    }
  } catch (err) {
    console.error("IP location lookup failed:", err.message);
  }
  return null;
}

exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: "Email is required" });

    let ip = req.headers["x-client-ip"] || req.ip || req.headers["x-forwarded-for"] || req.connection?.remoteAddress;
    if (ip && ip.includes(",")) {
      ip = ip.split(",")[0].trim();
    }
    if (ip && !net.isIP(ip)) {
      return res.status(400).json({ msg: "Invalid IP address" });
    }

    const userAgent = req.headers["x-user-agent"] || req.headers["user-agent"] || "";
    const { deviceType, browser, os } = parseUserAgent(userAgent);
    const location = await getLocationFromIp(ip);

    await Newsletter.create({ 
      email, 
      ip: ip || null,
      deviceType,
      browser,
      os,
      location
    });

    const welcomeHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a365d;">Welcome to Navigate Business!</h2>
        <p>Thank you for subscribing to our newsletter.</p>
        <p>You'll receive the latest updates, insights, and exclusive content directly in your inbox.</p>
        <p style="color: #666; font-size: 14px;">Best regards,<br/>The Navigate Business Team</p>
      </div>
    `;

    await sendMail({
      to: email,
      subject: "Welcome to Navigate Business!",
      html: welcomeHtml,
    }).catch((err) => console.error("Welcome email failed:", err.message));

    res.json({ msg: "Subscribed successfully" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ msg: "Email already subscribed" });
    }
    console.error("Subscribe error:", err);
    res.status(500).json({ msg: "Subscription failed", error: err.message });
  }
};

exports.getSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.find().sort({ createdAt: -1 });
    res.json({ subscribers });
  } catch (err) {
    console.error("Get subscribers error:", err);
    res.status(500).json({ msg: "Failed to fetch subscribers", error: err.message });
  }
};

exports.deleteSubscriber = async (req, res) => {
  try {
    const { id } = req.params;
    const sub = await Newsletter.findByIdAndDelete(id);
    if (!sub) return res.status(404).json({ msg: "Subscriber not found" });

    res.json({ msg: "Subscriber deleted successfully" });
  } catch (err) {
    console.error("Delete subscriber error:", err);
    res.status(500).json({ msg: "Failed to delete subscriber", error: err.message });
  }
};
