// .toimage — sticker citado a imagen (ffmpeg).
import { execFile } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

export default {
  command: ['toimage', 'toimg', 'apng'],
  category: 'utils',
  desc: 'Convierte sticker a imagen',
  run: async ({ msg, sock }) => {
    try {
      const qm = msg.quoted || {};
      const direct = (msg.message || {}).stickerMessage;
      const target = direct || qm.stickerMessage;
      if (!target) return msg.reply('❍ Cita un sticker con *.toimage*.');
      const buffer = direct ? await msg.download() : await msg.downloadQuoted();
      if (!buffer) return msg.reply('❍ No se pudo descargar el sticker.');
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'timg-'));
      try {
        const inp = path.join(dir, 'in.webp');
        const out = path.join(dir, 'out.png');
        fs.writeFileSync(inp, buffer);
        await new Promise((res, rej) => execFile('ffmpeg', ['-y', '-i', inp, out], { timeout: 30000 }, (e) => (e ? rej(e) : res())));
        const png = fs.readFileSync(out);
        await sock.sendMessage(msg.chat, { image: png, caption: `> *${global.botname2} • ${global.dev}*` }, { quoted: { key: msg.key, message: {} } });
      } finally {
        try {
          fs.rmSync(dir, { recursive: true, force: true });
        } catch {}
      }
    } catch (e) {
      console.error('[toimage]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
