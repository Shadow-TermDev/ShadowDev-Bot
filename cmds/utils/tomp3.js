// .tomp3 — video/audio a MP3 (ffmpeg, local).
import { execFile } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

export default {
  command: ['tomp3', 'toudio', 'amp3'],
  category: 'utils',
  desc: 'Convierte video/audio a MP3',
  run: async ({ msg, sock, prefix }) => {
    try {
      const mm = msg.message || {};
      const qm = msg.quoted || {};
      const has = mm.videoMessage || mm.audioMessage || qm.videoMessage || qm.audioMessage;
      if (!has) return msg.reply(`❍ Envía o cita un video/audio con *${prefix}tomp3*.`);
      const buffer = (mm.videoMessage || mm.audioMessage) ? await msg.download() : await msg.downloadQuoted();
      if (!buffer) return msg.reply('❍ No se pudo descargar.');
      await msg.react('🕒');
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tomp3-'));
      try {
        const inp = path.join(dir, 'in.bin');
        const out = path.join(dir, 'out.mp3');
        fs.writeFileSync(inp, buffer);
        await new Promise((res, rej) => execFile('ffmpeg', ['-y', '-i', inp, '-vn', '-c:a', 'libmp3lame', '-b:a', '128k', out], { timeout: 90000 }, (e) => (e ? rej(e) : res())));
        const mp3 = fs.readFileSync(out);
        await sock.sendMessage(msg.chat, { audio: mp3, mimetype: 'audio/mpeg', fileName: 'audio.mp3' }, { quoted: { key: msg.key, message: {} } });
        await msg.react('✔️');
      } finally {
        try {
          fs.rmSync(dir, { recursive: true, force: true });
        } catch {}
      }
    } catch (e) {
      console.error('[tomp3]', e?.message || e);
      try {
        await msg.react('✖️');
      } catch {}
      await msg.reply(global.msgglobal);
    }
  }
};
