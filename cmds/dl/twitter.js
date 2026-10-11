// .twitter — vía API Stellar (reemplaza tweeload caído, parche probado en Hutao).
import fetch from 'node-fetch';

export default {
  command: ['twitter', 'x', 'xdl'],
  category: 'downloader',
  desc: 'Descarga videos/fotos de X (Twitter)',
  uso: '<url>',
  run: async ({ msg, sock, args }) => {
    try {
      const url = args[0];
      if (!url?.includes('x.com') && !url?.includes('twitter.com')) {
        return msg.reply('✎ Ejemplo: *.twitter* https://x.com/.../status/...');
      }
      const res = await fetch(
        `${global.api.url}/dl/twitter?url=${encodeURIComponent(url)}&key=${global.api.key}`
      ).then((r) => r.json());
      if (!res?.status || !res.data?.result?.length) {
        return msg.reply('✿ No se encontró contenido descargable.');
      }
      const d = res.data;
      for (const item of d.result) {
        if (item.url?.includes('.mp4')) {
          await sock.sendMessage(msg.chat, { video: { url: item.url }, caption: d.title || '' }, { quoted: { key: msg.key, message: {} } });
        } else {
          await sock.sendMessage(msg.chat, { image: { url: item.url }, caption: d.title || '' }, { quoted: { key: msg.key, message: {} } });
        }
      }
    } catch (e) {
      console.error('[twitter]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
