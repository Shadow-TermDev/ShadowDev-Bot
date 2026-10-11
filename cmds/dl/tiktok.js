// .tiktok — vía tikwm (gratis, sin key).
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
      const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`).then((r) => r.json());
      const d = res?.data;
      const dl = d?.play || d?.wmplay;
      if (res?.code !== 0 || !dl) {
        return msg.reply('✿ No se pudo descargar (verifica que el video sea público).');
      }
      const caption =
        `★ *TikTok Download*\n\n` +
        `> ✿ Título: ${d.title || 'Sin título'}\n` +
        `> ★ Autor: @${d.author?.unique_id || d.author?.nickname || '?'}\n` +
        `> ♡ Likes: ${(d.digg_count || 0).toLocaleString()}`;
      await sock.sendMessage(
        msg.chat,
        { video: { url: dl }, caption },
        { quoted: { key: msg.key, message: {} } }
      );
    } catch (e) {
      console.error('[tiktok]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
