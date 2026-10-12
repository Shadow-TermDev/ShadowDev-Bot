// .sticker — imagen o video ≤6s a sticker con pack/autor (adjunto o cita).
import { addExif, toSticker } from '../../lib/sticker.js';
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
      const cited = qm.imageMessage || qm.videoMessage || qm.stickerMessage;
      const target = direct || cited;
      if (!target) {
        return msg.reply(`❍ Envía una imagen o video (máx 6s) con *${prefix}s* en el pie de foto, cita uno o cita un sticker con *${prefix}s*.`);
      }
      const isQuotedSticker = !direct && !!qm.stickerMessage;
      if ((target.seconds || 0) > 8) return msg.reply('❍ Video muy largo, máximo 6 segundos.');
      const buffer = direct ? await msg.download() : await msg.downloadQuoted();
      if (!buffer) return msg.reply('❍ No se pudo descargar el archivo.');
      await msg.react('🕒');
      // Sticker citado: ya es webp, solo se re-etiqueta (rápido y sin perder calidad)
      const webp = isQuotedSticker ? buffer : await toSticker(buffer, !!target.seconds);
      const nombre = displayName(msg.sender, msg.pushName);
      let grupo = '';
      if (msg.isGroup) {
        try {
          grupo = (await sock.groupMetadata(msg.chat))?.subject || '';
        } catch {}
      }
      const autor = grupo ? `${nombre} · ${grupo}` : nombre;
      const final = await addExif(webp, { pack: 'ShadowDev', author: autor, link: global.link }).catch(() => webp);
      await sock.sendMessage(msg.chat, { sticker: final }, { quoted: { key: msg.key, message: {} } });
      await msg.react('✔️');
    } catch (e) {
      console.error('[sticker]', e?.message || e);
      try {
        await msg.react('✖️');
      } catch {}
      await msg.reply('❍ No se pudo crear el sticker (¿tienes ffmpeg instalado?).');
    }
  }
};
