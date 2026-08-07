const db = require("./db");
const bcrypt = require("bcryptjs");

const initDB = () => {
  // ADMINS TABLE
  const createAdminsTable = `
    CREATE TABLE IF NOT EXISTS admins (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(191) NOT NULL UNIQUE,
      email VARCHAR(191) UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  // BLOGS TABLE
  const createBlogsTable = `
    CREATE TABLE IF NOT EXISTS blogs (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(191) NOT NULL,
      slug VARCHAR(191) NOT NULL UNIQUE,
      image VARCHAR(191),
      image_alt VARCHAR(191),
      short_description TEXT,
      details LONGTEXT NOT NULL,
      status ENUM('draft','published') DEFAULT 'draft',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  // SERVICES TABLE
  const createServicesTable = `
    CREATE TABLE IF NOT EXISTS services (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(191) NOT NULL,
      slug VARCHAR(191) NOT NULL UNIQUE,
      short_description TEXT,
      long_description LONGTEXT,
      image VARCHAR(191),
      image_alt VARCHAR(191),
      feature_image VARCHAR(191),
      feature_image_alt VARCHAR(191),
      status ENUM('active','inactive') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  // CONTACTS TABLE
  const createContactsTable = `
    CREATE TABLE IF NOT EXISTS contacts (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(191) NOT NULL,
      email VARCHAR(191) NOT NULL,
      phone_number VARCHAR(191) NOT NULL,
      subject VARCHAR(191) NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  // VIDEOS TABLE
  const createVideosTable = `
    CREATE TABLE IF NOT EXISTS videos (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(191) NOT NULL,
      short_description TEXT,
      video_url VARCHAR(500),
      thumbnail VARCHAR(191),
      thumbnail_alt VARCHAR(191),
      status ENUM('draft','published','archived') DEFAULT 'draft',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
`;

  const createNewsletterTable = `
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(191) NOT NULL UNIQUE,
      subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.query(createAdminsTable, (err) => {
    if (err) {
      console.log("❌ Admins table error:", err);
    } else {
      console.log("✅ Admins table ready");
      // Seed default admin
      const seedAdmin = async () => {
        const hashedPassword = await bcrypt.hash("root", 10);
        db.query(
          "INSERT IGNORE INTO admins (username, email, password) VALUES (?, ?, ?)",
          ["admin", "admin@example.com", hashedPassword],
          (err) => {
            if (err) {
              console.log("❌ Seed admin error:", err);
            } else {
              console.log("✅ Default admin seeded");
            }
          },
        );
      };
      seedAdmin();
    }
  });

  db.query(createBlogsTable, (err) => {
    if (err) {
      console.log("❌ Blogs table error:", err);
    } else {
      console.log("✅ Blogs table ready");
    }
  });
  db.query(createServicesTable, (err) => {
    if (err) {
      console.log("❌ Services table error:", err);
    } else {
      console.log("✅ Services table ready");
    }
  });
  db.query(createContactsTable, (err) => {
    if (err) {
      console.log("❌ Contacts table error:", err);
    } else {
      console.log("✅ Contacts table ready");
    }
  });
  db.query(createVideosTable, (err) => {
    if (err) {
      console.log("❌ Videos table error:", err);
    } else {
      console.log("✅ Videos table ready");
    }
  });

  db.query(createNewsletterTable, (err) => {
    if (err) {
      console.log("❌ Newsletter table error:", err);
    } else {
      console.log("✅ Newsletter table ready");
    }
  });
};

module.exports = initDB;
