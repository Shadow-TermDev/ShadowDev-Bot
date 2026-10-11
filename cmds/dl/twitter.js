// .twitter — vía fxtwitter (gratis, sin key, reemplaza Stellar/tweeload muertos).
import fetch from 'node-fetch';

export default {
  command: ['twitter', 'x', 'xdl'],
  category: 'downloader',
  desc: 'Descarga videos/fotos de X (Twitter)',
  uso: '<url>',
  run: async ({ msg, sock, args }) => {
    try {
      const url = args[0];
      if (!url?.match(/(x\.com|twitter\.com)\/\w+\/status\/\d+/)) {
        return msg.reply('❍ Ejemplo: *.twitter* https://x.com/usuario/status/123...');
      }
      const id = url.match(/status\/(\d+)/)[1];
      await msg.reply('> _Descargando contenido de X, espera..._');
      const res = await fetch(`https://api.fxtwitter.com/i/status/${id}`).then((r) => r.json());
      const tw = res?.tweet;
      if (res?.code !== 200 || !tw) return msg.reply('❍ No se pudo obtener el tweet.');
      const media = tw.media || {};
      const videos = media.videos || [];
      const photos = media.photos || [];
      if (!videos.length && !photos.length) return msg.reply('❍ Ese tweet no tiene multimedia descargable.');
      const caption = `• :･ﾟ⊹˚• \`『 X-Download 』\` •˚⊹:･ﾟ•\n\n> ✦ ${tw.text ? tw.text.slice(0, 200) : 'Aquí tiene su archivo'}`;
      for (const v of videos) {
        await sock.sendMessage(msg.chat, { video: { url: v.url }, caption }, { quoted: { key: msg.key, message: {} } });
      }
      for (const p of photos) {
        await sock.sendMessage(msg.chat, { image: { url: p.url }, caption }, { quoted: { key: msg.key, message: {} } });
      }
    } catch (e) {
      console.error('[twitter]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
