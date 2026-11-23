// news-image-20261123 entry (Node 22, standard library only): writes the
// front page for Monday 23 November 2026 to /output/entry.png.
//
// The image is drawn by draw.py (deterministic: same bytes every run) and
// kept beside this file as entry.png; this program validates the PNG header
// and copies it to the output directory.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const source = new URL('./entry.png', import.meta.url);
const bytes = readFileSync(source);

// PNG signature: 89 50 4E 47 0D 0A 1A 0A, then the IHDR chunk.
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (!bytes.subarray(0, 8).equals(PNG_SIGNATURE)) {
  throw new Error('entry.png is not a PNG file');
}
if (bytes.toString('latin1', 12, 16) !== 'IHDR') {
  throw new Error('entry.png has no IHDR chunk');
}
const width = bytes.readUInt32BE(16);
const height = bytes.readUInt32BE(20);
if (width !== 1024 || height !== 1024) {
  throw new Error(`entry.png must be 1024x1024, got ${width}x${height}`);
}
if (bytes.length > 1048576) {
  throw new Error(`entry.png must be at most 1 MiB, got ${bytes.length} bytes`);
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const outPath = join(outDir, 'entry.png');
copyFileSync(source, outPath);

// Verify the written file is byte-identical to the validated source.
const written = readFileSync(outPath);
if (!written.equals(bytes)) {
  throw new Error('written entry.png differs from the validated source');
}
console.log(`wrote ${outPath}: ${written.length} bytes, 1024x1024 PNG`);
