// .ig — Instagram vía Stellar con respaldo EvoGB (reciclado de Hutao).
import axios from 'axios';

async function tryStellar(url) {
  const { data } = await axios.get(`${global.api.url}/dl/instagram?url=${encodeURIComponent(url)}&key=${global.api.key}`, { timeout: 30000 });
  const dl = data?.data?.download || data?.data?.dl;
  if (!data?.status || !dl) return null;
  return Array.isArray(dl) ? dl : [{ url: dl, type: 'video' }];
}

async function tryEvogb(url) {
  const { data } = await axios.get(`${global.api2.url}/dl/instagram?url=${encodeURIComponent(url)}&key=${global.api2.key}`, { timeout: 30000 });
  if (!data?.status || !data?.data?.download) return null;
  return data.data.download;
}

export default {
  command: ['instagram', 'ig', 'reel'],
  category: 'downloader',
  desc: 'Descarga fotos/videos de Instagram',
  uso: '<url>',
  run: async ({ msg, sock, args }) => {
    try {
      const url = args.find((a) => /instagram\.com\/(p|reel|share|tv)\//.test(a));
      if (!url) return msg.reply('✿ El enlace no parece válido. Asegúrate de que sea de Instagram.');
      const downloads = (await tryStellar(url)) || (await tryEvogb(url));
      if (!downloads?.length) return msg.reply('✿ No se pudo obtener el contenido.');
      for (const m of downloads.slice(0, 5)) {
        if (m.type === 'video') {
          await sock.sendMessage(msg.chat, { video: { url: m.url }, mimetype: 'video/mp4' }, { quoted: { key: msg.key, message: {} } });
        } else {
          await sock.sendMessage(msg.chat, { image: { url: m.url } }, { quoted: { key: msg.key, message: {} } });
        }
      }
    } catch (e) {
      console.error('[ig]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
