// Stickers vía ffmpeg (sin dependencias): imagen o video ≤6s → webp.
import { execFile } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import Crypto from 'crypto';
import webp from 'node-webpmux';

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { timeout: 60000 }, (err, stdout, stderr) => {
      if (err) reject(new Error(stderr?.slice(0, 200) || err.message));
      else resolve(stdout);
    });
  });
}

export async function toSticker(buffer, isVideo) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'stk-'));
  const inp = path.join(dir, isVideo ? 'in.mp4' : 'in.jpg');
  const out = path.join(dir, 'out.webp');
  try {
    fs.writeFileSync(inp, buffer);
    if (isVideo) {
      await run('ffmpeg', ['-y', '-i', inp, '-t', '6', '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:-1:-1:color=white', '-c:v', 'libwebp', '-lossless', '0', '-q:v', '60', '-loop', '0', '-an', out]);
    } else {
      await run('ffmpeg', ['-y', '-i', inp, '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:-1:-1:color=white', out]);
    }
    const webp = fs.readFileSync(out);
    if (webp.length < 100) throw new Error('webp vacío');
    return webp;
  } finally {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
    } catch {}
  }
}

// EXIF con pack/autor DENTRO del sticker (se ve en WhatsApp, sin mensajes extra)
export async function addExif(webpBuffer, packname, author) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'exif-'));
  const tmpIn = path.join(dir, `in-${Crypto.randomBytes(4).toString('hex')}.webp`);
  const tmpOut = path.join(dir, `out-${Crypto.randomBytes(4).toString('hex')}.webp`);
  try {
    fs.writeFileSync(tmpIn, webpBuffer);
    const img = new webp.Image();
    const json = {
      'sticker-pack-id': 'https://Shadow-TermDev.github.io',
      'sticker-pack-name': packname || 'ShadowDev',
      'sticker-pack-publisher': author || 'ShadowDev-Bot',
      emojis: ['']
    };
    const exifAttr = Buffer.from([
      0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00
    ]);
    const jsonBuff = Buffer.from(JSON.stringify(json), 'utf-8');
    const exif = Buffer.concat([exifAttr, jsonBuff]);
    exif.writeUIntLE(jsonBuff.length, 14, 4);
    await img.load(tmpIn);
    img.exif = exif;
    await img.save(tmpOut);
    return fs.readFileSync(tmpOut);
  } finally {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
    } catch {}
  }
}
