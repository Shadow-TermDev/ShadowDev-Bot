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
      const cited = qm.imageMessage || qm.videoMessage;
      const target = direct || cited;
      if (!target) {
        return msg.reply(`❍ Envía una imagen o video (máx 6s) con *${prefix}s* en el pie de foto o cita uno con *${prefix}s*.`);
      }
      if ((target.seconds || 0) > 8) return msg.reply('❍ Video muy largo, máximo 6 segundos.');
      const buffer = direct ? await msg.download() : await msg.downloadQuoted();
      if (!buffer) return msg.reply('❍ No se pudo descargar el archivo.');
      await msg.react('🕒');
      const webp = await toSticker(buffer, !!target.seconds);
      const nombre = displayName(msg.sender, msg.pushName);
      const final = await addExif(webp, 'ShadowDev', `Por ${nombre}`).catch(() => webp);
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
