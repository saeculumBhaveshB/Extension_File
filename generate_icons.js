// This is a Node.js script to generate PNG icons from the SVG
// You'll need to install the 'sharp' package: npm install sharp

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const sizes = [16, 48, 128];
const svgPath = path.join(__dirname, "images", "icon.svg");
const svgBuffer = fs.readFileSync(svgPath);

async function generateIcons() {
  for (const size of sizes) {
    const outputPath = path.join(__dirname, "images", `icon${size}.png`);

    try {
      await sharp(svgBuffer).resize(size, size).png().toFile(outputPath);

      console.log(`Generated ${outputPath}`);
    } catch (error) {
      console.error(`Error generating ${outputPath}:`, error);
    }
  }
}

generateIcons().catch(console.error);
