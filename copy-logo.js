import fs from "fs";
import path from "path";

try {
  const srcPath = path.join(process.cwd(), "src/assets/images/club_logo_1780074680882.png");
  const destDir = path.join(process.cwd(), "public");
  const destPath = path.join(destDir, "logo.png");

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log("Successfully prepared and copied public/logo.png for build/preview.");
  } else {
    console.warn("Source logo image not found at:", srcPath);
  }
} catch (error) {
  console.error("Error copying logo:", error);
}
