function contact({ name, email, phone, subject, message }) {
  const date = new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" });

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f7f6;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#0d7a7a;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:22px;">New Contact Message</h1>
              <p style="margin:4px 0 0;color:#b2dfdb;font-size:13px;">${date}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom:20px;">
                    <p style="margin:0 0 4px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Name</p>
                    <p style="margin:0;color:#1a1a1a;font-size:16px;font-weight:600;">${name}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:20px;">
                    <p style="margin:0 0 4px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Email</p>
                    <p style="margin:0;color:#1a1a1a;font-size:16px;">
                      <a href="mailto:${email}" style="color:#0d7a7a;text-decoration:none;">${email}</a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:20px;">
                    <p style="margin:0 0 4px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Phone</p>
                    <p style="margin:0;color:#1a1a1a;font-size:16px;">${phone || "—"}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:20px;">
                    <p style="margin:0 0 4px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Subject</p>
                    <p style="margin:0;color:#1a1a1a;font-size:16px;">${subject || "—"}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:8px;">
                    <p style="margin:0 0 4px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Message</p>
                    <div style="background:#f8faf9;border-radius:8px;padding:20px;margin-top:8px;line-height:1.7;color:#333;font-size:14px;white-space:pre-wrap;">${message}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#f8faf9;padding:20px 40px;text-align:center;border-top:1px solid #eef2f1;">
              <p style="margin:0;color:#999;font-size:12px;">This message was sent from the contact form on <strong>navigatebusinesses.com</strong></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function newBlogNotification({ blogTitle, blogSlug, shortDescription }) {
  const blogUrl = `${process.env.FRONTEND_URL}/blogs/${blogSlug}`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f7f6;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#0d7a7a;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:22px;">New Blog Post Published!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <h2 style="margin:0 0 16px;color:#1a1a1a;font-size:20px;">${blogTitle}</h2>
              <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.6;">${shortDescription || ""}</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:16px 0;">
                    <a href="${blogUrl}" style="display:inline-block;background:#0d7a7a;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:600;">Read Full Article →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#f8faf9;padding:20px 40px;text-align:center;border-top:1px solid #eef2f1;">
              <p style="margin:0;color:#999;font-size:12px;">You're receiving this because you subscribed to our newsletter.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

module.exports = { contact, newBlogNotification };
