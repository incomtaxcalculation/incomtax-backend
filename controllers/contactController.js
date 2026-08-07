const Contact = require("../models/Contact");

exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({ contacts });
  } catch (err) {
    console.error("Get contacts error:", err);
    res.status(500).json({ msg: "Failed to fetch contacts", error: err.message });
  }
};

exports.createContact = async (req, res) => {
  try {
    const { name, email, phone_number, subject, message } = req.body;

    await Contact.create({ name, email, phone_number, subject, message });
    res.json({ msg: "Contact created successfully" });
  } catch (err) {
    console.error("Create contact error:", err);
    res.status(500).json({ msg: "Failed to create contact", error: err.message });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findByIdAndDelete(id);
    if (!contact) return res.status(404).json({ msg: "Contact not found" });

    res.json({ msg: "Contact deleted successfully" });
  } catch (err) {
    console.error("Delete contact error:", err);
    res.status(500).json({ msg: "Failed to delete contact", error: err.message });
  }
};
