// .fb — videos de Facebook vía API Stellar (reciclado de Hutao).
import fetch from 'node-fetch';

export default {
  command: ['fb', 'facebook'],
  category: 'downloader',
  desc: 'Descarga videos de Facebook',
  uso: '<url>',
  run: async ({ msg, sock, args }) => {
    try {
      const urls = args.filter((a) => /facebook\.com|fb\.watch/.test(a));
      if (!urls.length) return msg.reply('✎ Envía un link válido de Facebook.');
      for (const url of urls.slice(0, 3)) {
        const res = await fetch(`${global.api.url}/dl/facebookv2?url=${url}&key=${global.api.key}`);
        if (!res.ok) continue;
        const buf = Buffer.from(await res.arrayBuffer());
        await sock.sendMessage(
          msg.chat,
          { video: buf, mimetype: 'video/mp4', fileName: 'fb.mp4' },
          { quoted: { key: msg.key, message: {} } }
        );
      }
    } catch (e) {
      console.error('[fb]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
