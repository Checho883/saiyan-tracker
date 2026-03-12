import sharp from 'sharp';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const RAW_DIR = 'public/assets/raw';
const OUT_DIR = 'public/assets/avatars';

// Map raw filenames (with extension) to output names
const FORM_MAP = {
  'base-goku.jpg': 'base',
  'ssj-goku-full body.jpg': 'ssj',
  'ss2 after a long figt.jpg': 'ssj2',
  'ssj3-goku.jpg': 'ssj3',
  'ssg-goku.jpg': 'ssg',
  'blue hair-goku.jpg': 'ssb',
  'ultra-goku.jpg': 'ui',
  'goku-portrait.jpg': 'goku',
  'vegeta smiling and angry at you.jpg': 'vegeta',
};

// Avatar dimensions (2x retina)
const AVATAR_SIZE = 256;   // Transformation avatars (displays at 96px)
const PORTRAIT_SIZE = 128; // Character portraits (displays at 40px)

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

let processed = 0;
let failed = 0;

for (const [file, outName] of Object.entries(FORM_MAP)) {
  const inputPath = join(RAW_DIR, file);
  if (!existsSync(inputPath)) {
    console.error(`MISSING: ${file}`);
    failed++;
    continue;
  }

  const isPortrait = outName === 'goku' || outName === 'vegeta';
  const size = isPortrait ? PORTRAIT_SIZE : AVATAR_SIZE;

  try {
    await sharp(inputPath)
      .resize(size, size, { fit: 'cover', position: 'top' })
      .webp({ quality: 85, alphaQuality: 100 })
      .toFile(join(OUT_DIR, `${outName}.webp`));
    console.log(`OK ${file} -> ${outName}.webp (${size}x${size})`);
    processed++;
  } catch (err) {
    console.error(`FAIL ${file}: ${err.message}`);
    failed++;
  }
}

console.log(`\nDone: ${processed} processed, ${failed} failed`);
if (failed > 0) process.exit(1);
