const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

/**
 * Compress and convert image to WebP format
 * @param {string} inputPath - Path to the input image file
 * @param {string} outputDir - Directory to save the compressed image
 * @param {number} quality - WebP quality (0-100), default 80
 * @param {number} maxWidth - Maximum width for resizing, default 1200
 * @returns {Promise<string>} - Path to the compressed WebP image
 */
async function compressToWebP(inputPath, outputDir, quality = 80, maxWidth = 1200) {
  try {
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate output filename with .webp extension
    const filename = path.basename(inputPath, path.extname(inputPath));
    const outputPath = path.join(outputDir, `${filename}.webp`);

    // Process image: resize if needed and convert to WebP
    await sharp(inputPath)
      .resize(maxWidth, null, {
        withoutEnlargement: true,
        fit: "inside",
      })
      .webp({ quality })
      .toFile(outputPath);

    console.log(`✅ Compressed and converted to WebP: ${outputPath}`);

    // Delete original file after successful conversion
    fs.unlinkSync(inputPath);
    console.log(`🗑️ Deleted original file: ${inputPath}`);

    return outputPath;
  } catch (error) {
    console.error("❌ Error compressing image:", error);
    throw error;
  }
}

module.exports = { compressToWebP };
