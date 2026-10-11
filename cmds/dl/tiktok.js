// .tiktok — vía API Stellar (reciclada de Hutao).
import fetch from 'node-fetch';

export default {
  command: ['tiktok', 'tt'],
  category: 'downloader',
  desc: 'Descarga videos de TikTok',
  uso: '<url>',
  run: async ({ msg, sock, args }) => {
    try {
      const url = args.find((a) => a.includes('tiktok.com'));
      if (!url) return msg.reply('✿ Envía un enlace válido de TikTok.');
      const res = await fetch(
        `${global.api.url}/dl/tiktok?url=${encodeURIComponent(url)}&key=${global.api.key}`
      ).then((r) => r.json());
      if (!res?.status || !res.data?.dl) {
        return msg.reply('✿ No se pudo descargar (algunos videos están bloqueados por TikTok).');
      }
      const d = res.data;
      await sock.sendMessage(
        msg.chat,
        { video: { url: d.dl }, caption: `★ ${d.title || 'TikTok'} — @${d.author?.unique_id || ''}` },
        { quoted: { key: msg.key, message: {} } }
      );
    } catch (e) {
      console.error('[tiktok]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
