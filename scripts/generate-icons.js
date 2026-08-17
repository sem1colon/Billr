import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svgPath = path.resolve(__dirname, '../public/icon.svg');
const svgBuffer = fs.readFileSync(svgPath);

async function generate() {
  console.log('Generating high-resolution PWA and Apple Touch icons...');

  // Apple Touch Icon (180x180 for iOS Safari)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.resolve(__dirname, '../public/apple-touch-icon.png'));
  console.log('✓ public/apple-touch-icon.png (180x180)');

  // 192x192 PWA Icon
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.resolve(__dirname, '../public/icon-192.png'));
  console.log('✓ public/icon-192.png (192x192)');

  // 512x512 PWA Icon
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.resolve(__dirname, '../public/icon-512.png'));
  console.log('✓ public/icon-512.png (512x512)');

  // 32x32 Favicon
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.resolve(__dirname, '../public/favicon-32x32.png'));
  console.log('✓ public/favicon-32x32.png (32x32)');

  console.log('All icons generated successfully!');
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
