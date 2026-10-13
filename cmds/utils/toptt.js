// .toptt — audio a nota de voz.
export default {
  command: ['toptt', 'tovoice', 'nota'],
  category: 'utils',
  desc: 'Convierte audio a nota de voz',
  run: async ({ msg, sock, prefix }) => {
    try {
      const mm = msg.message || {};
      const qm = msg.quoted || {};
      const has = mm.audioMessage || mm.videoMessage || qm.audioMessage || qm.videoMessage;
      if (!has) return msg.reply(`❍ Envía o cita un audio/video con *${prefix}toptt*.`);
      const buffer = (mm.audioMessage || mm.videoMessage) ? await msg.download() : await msg.downloadQuoted();
      if (!buffer) return msg.reply('❍ No se pudo descargar.');
      await sock.sendMessage(msg.chat, { audio: buffer, mimetype: 'audio/ogg; codecs=opus', ptt: true }, { quoted: { key: msg.key, message: {} } });
    } catch (e) {
      console.error('[toptt]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
