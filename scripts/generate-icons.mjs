import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const svgPath = join(root, 'public', 'logo.svg');
const outputDir = join(root, 'public', 'icons');

mkdirSync(outputDir, { recursive: true });

const svgBuffer = readFileSync(svgPath);

for (const size of sizes) {
  // Logo fits within 80% safe zone for maskable icons
  const logoSize = Math.round(size * 0.8);
  const offset = Math.round((size - logoSize) / 2);

  const resizedLogo = await sharp(svgBuffer)
    .resize(logoSize, logoSize)
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 10, g: 10, b: 10, alpha: 1 }, // #0a0a0a
    },
  })
    .composite([{ input: resizedLogo, top: offset, left: offset }])
    .png()
    .toFile(join(outputDir, `icon-${size}x${size}.png`));

  console.log(`✓ icon-${size}x${size}.png`);
}

console.log('\nAll icons generated in public/icons/');
