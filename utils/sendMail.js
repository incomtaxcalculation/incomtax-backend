const { BrevoClient } = require("@getbrevo/brevo");

async function sendMail({ to, subject, html, sender }) {
  const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

  const recipients = Array.isArray(to)
    ? to.map((email) => ({ email }))
    : [{ email: to }];

  await client.transactionalEmails.sendTransacEmail({
    sender: sender || {
      email: process.env.BREVO_SENDER_EMAIL || "contact@noumandevs.online",
      name: "Navigate Business",
    },
    to: recipients,
    subject,
    htmlContent: html,
  });
}

module.exports = { sendMail };