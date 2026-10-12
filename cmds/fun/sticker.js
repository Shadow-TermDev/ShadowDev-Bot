// .sticker — imagen o video ≤6s a sticker (envíalo con .s en el pie o cita).
import { toSticker } from '../../lib/sticker.js';
import { displayName } from '../../lib/users.js';

export default {
  command: ['sticker', 's', 'stiker'],
  category: 'fun',
  desc: 'Convierte imagen/video en sticker',
  run: async ({ msg, sock, prefix }) => {
    try {
      const mm = msg.message || {};
      const ctx = mm.extendedTextMessage?.contextInfo || {};
      const quoted = ctx.quotedMessage || {};
      const img = mm.imageMessage || quoted.imageMessage;
      const vid = mm.videoMessage || quoted.videoMessage;
      const fromQuote = !!(quoted.imageMessage || quoted.videoMessage);
      if (!img && !vid) {
        return msg.reply(`❍ Envía una imagen o video (máx 6s) con *${prefix}s* en el pie de foto o cita un mensaje.`);
      }
      if (vid && (vid.seconds || 0) > 8) return msg.reply('❍ Video muy largo, máximo 6 segundos.');
      const buffer = await msg.download();
      if (!buffer) return msg.reply('❍ No se pudo descargar el archivo.');
      await msg.reply('> ✐ _Haciendo sticker..._');
      const webp = await toSticker(buffer, !!vid);
      const nombre = displayName(msg.sender, msg.pushName);
      const desc = fromQuote
        ? `✿ Sticker de ${nombre}\n> ✐ Hecho con ShadowDev-Bot`
        : `✿ Sticker de ${nombre}\n> ✐ ${global.dev}`;
      await sock.sendMessage(msg.chat, { sticker: webp, caption: desc }, { quoted: { key: msg.key, message: {} } });
    } catch (e) {
      console.error('[sticker]', e?.message || e);
      await msg.reply('❍ No se pudo crear el sticker (¿tienes ffmpeg instalado?).');
    }
  }
};
