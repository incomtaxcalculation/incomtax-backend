const Message = require("../models/Message");
const { sendMail, contact } = require("../utils/email");

exports.createMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    const saved = await Message.create({ name, email, phone, subject, message });

    sendMail({
      to: ["noumandev1221@gmail.com", "yasirrehman274@gmail.com", "info@incometaxcalculation.pk", "taxfilerbanay@gmail.com"],
      subject: `New Contact Form Submission — ${name}`,
      html: contact({ name, email, phone, subject, message }),
    }).catch((err) =>
      console.error("Failed to send email:", err)
    );

    res.json({ msg: "Message sent successfully" });
  } catch (err) {
    console.error("Create message error:", err);
    res.status(500).json({ msg: "Failed to send message", error: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json({ messages });
  } catch (err) {
    console.error("Get messages error:", err);
    res.status(500).json({ msg: "Failed to fetch messages", error: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );
    if (!message) return res.status(404).json({ msg: "Message not found" });

    res.json({ msg: "Message marked as read", message });
  } catch (err) {
    console.error("Mark as read error:", err);
    res.status(500).json({ msg: "Failed to update message", error: err.message });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.findByIdAndDelete(id);
    if (!message) return res.status(404).json({ msg: "Message not found" });

    res.json({ msg: "Message deleted successfully" });
  } catch (err) {
    console.error("Delete message error:", err);
    res.status(500).json({ msg: "Failed to delete message", error: err.message });
  }
};