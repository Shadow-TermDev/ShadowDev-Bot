// .sticker — imagen o video ≤6s a sticker (envíalo con .s en el pie).
import { toSticker } from '../../lib/sticker.js';

export default {
  command: ['sticker', 's', 'stiker'],
  category: 'fun',
  desc: 'Convierte imagen/video en sticker',
  run: async ({ msg, sock, prefix }) => {
    try {
      const mm = msg.message || {};
      const img = mm.imageMessage;
      const vid = mm.videoMessage;
      if (!img && !vid) {
        return msg.reply(`❍ Envía una imagen o video (máx 6s) con *${prefix}s* en el pie de foto.`);
      }
      if (vid && (vid.seconds || 0) > 8) return msg.reply('❍ Video muy largo, máximo 6 segundos.');
      const buffer = await msg.download();
      if (!buffer) return msg.reply('❍ No se pudo descargar el archivo.');
      await msg.reply('> ✦ _Haciendo sticker..._');
      const webp = await toSticker(buffer, !!vid);
      await sock.sendMessage(msg.chat, { sticker: webp }, { quoted: { key: msg.key, message: {} } });
    } catch (e) {
      console.error('[sticker]', e?.message || e);
      await msg.reply('❍ No se pudo crear el sticker (¿tienes ffmpeg instalado?).');
    }
  }
};
