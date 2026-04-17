import sharp from 'sharp';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const RAW_DIR = 'public/assets/raw';
const OUT_DIR = 'public/assets/avatars';
const CHAR_DIR = 'public/assets/characters';

// Per-image config: { source, out, kind, position }
//   kind: 'avatar' (256px transformation) | 'portrait' (128px character)
//   position: sharp's `position` for fit:'cover' — 'top' | 'centre' | 'attention' | 'right top' | etc.
//             'attention' uses entropy detection to pick the most interesting crop region.
const ASSETS = [
  { source: 'base-goku.jpg',                                  out: 'base',  kind: 'avatar',   position: 'attention' },
  { source: 'goku-ssj-kneeling down looking angry.jpg',       out: 'ssj',   kind: 'avatar',   position: 'attention' },
  { source: 'ss2 after a long figt.jpg',                      out: 'ssj2',  kind: 'avatar',   position: 'top' },
  { source: 'high definition ssj3.jpg',                       out: 'ssj3',  kind: 'avatar',   position: 'attention' },
  { source: 'close-up-goku red.jpg',                          out: 'ssg',   kind: 'avatar',   position: 'attention' },
  { source: 'ssb_face only.jpg',                              out: 'ssb',   kind: 'avatar',   position: 'centre' },
  { source: 'ultra-goku only face.webp',                      out: 'ui',    kind: 'avatar',   position: 'centre' },
  { source: 'goku-portrait.jpg',                              out: 'goku',  kind: 'portrait', position: 'attention' },
  { source: 'vegeta smiling and angry at you.jpg',            out: 'vegeta',kind: 'portrait', position: 'attention' },
  // Character portraits used by frontend cards
  { source: 'master rochi angry giving the middle finger great for not completing tasks.jpg',
                                                              out: 'roshi-angry', kind: 'portrait', position: 'attention', dir: CHAR_DIR },
];

const SIZES = { avatar: 256, portrait: 128 };

for (const dir of [OUT_DIR, CHAR_DIR]) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

let processed = 0;
let failed = 0;

for (const asset of ASSETS) {
  const inputPath = join(RAW_DIR, asset.source);
  if (!existsSync(inputPath)) {
    console.error(`MISSING: ${asset.source}`);
    failed++;
    continue;
  }

  const size = SIZES[asset.kind];
  const outDir = asset.dir ?? OUT_DIR;

  try {
    await sharp(inputPath)
      .resize(size, size, { fit: 'cover', position: asset.position })
      .webp({ quality: 85, alphaQuality: 100 })
      .toFile(join(outDir, `${asset.out}.webp`));
    console.log(`OK ${asset.source} -> ${asset.out}.webp (${size}x${size}, position=${asset.position})`);
    processed++;
  } catch (err) {
    console.error(`FAIL ${asset.source}: ${err.message}`);
    failed++;
  }
}

console.log(`\nDone: ${processed} processed, ${failed} failed`);
if (failed > 0) process.exit(1);
