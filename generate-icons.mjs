import sharp from 'sharp';
import fs from 'fs';

const sizes = [
  { name: 'icon-192.png', size: 192, maskable: false },
  { name: 'icon-512.png', size: 512, maskable: false },
  { name: 'icon-512-maskable.png', size: 512, maskable: true },
];

for (const s of sizes) {
  await sharp('public/icons/icon.svg')
    .resize(s.size, s.size)
    .png()
    .toFile(`public/icons/${s.name}`);
  console.log('Created', s.name);
}
