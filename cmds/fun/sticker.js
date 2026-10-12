// .sticker — imagen o video ≤6s a sticker (adjunto con .s en el pie o citando).
// La desc va en mensaje aparte: WhatsApp ignora captions en stickers.
import { toSticker } from '../../lib/sticker.js';
import { displayName } from '../../lib/users.js';

export default {
  command: ['sticker', 's', 'stiker'],
  category: 'fun',
  desc: 'Convierte imagen/video en sticker',
  run: async ({ msg, sock, prefix }) => {
    try {
      const mm = msg.message || {};
      const qm = msg.quoted || {};
      const direct = mm.imageMessage || mm.videoMessage;
      const cited = qm.imageMessage || qm.videoMessage;
      const target = direct || cited;
      if (!target) {
        return msg.reply(`❍ Envía una imagen o video (máx 6s) con *${prefix}s* en el pie de foto o cita uno con *${prefix}s*.`);
      }
      const secs = target.seconds || 0;
      if ((target.seconds || 0) > 8) return msg.reply('❍ Video muy largo, máximo 6 segundos.');
      const buffer = direct ? await msg.download() : await msg.downloadQuoted();
      if (!buffer) return msg.reply('❍ No se pudo descargar el archivo.');
      await msg.reply('> ✐ _Haciendo sticker..._');
      const webp = await toSticker(buffer, !!target.seconds);
      await sock.sendMessage(msg.chat, { sticker: webp }, { quoted: { key: msg.key, message: {} } });
      const nombre = displayName(msg.sender, msg.pushName);
      await sock.sendMessage(
        msg.chat,
        { text: `✿ Sticker de *${nombre}* ${secs ? `(${secs}s)` : ''}\n> ✐ Hecho con *${global.botname2}*` }
      );
    } catch (e) {
      console.error('[sticker]', e?.message || e);
      await msg.reply('❍ No se pudo crear el sticker (¿tienes ffmpeg instalado?).');
    }
  }
};
