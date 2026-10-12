// .tiktok — por link descarga el video; por texto busca y envía los primeros 10.
import fetch from 'node-fetch';

const UA = 'Mozilla/5.0 (Linux; Android 15; Pixel 7) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36';

async function byUrl(url) {
  const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`, {
    headers: { 'User-Agent': UA }
  }).then((r) => r.json());
  const d = res?.data;
  const dl = d?.play || d?.wmplay;
  if (res?.code !== 0 || !dl) return null;
  return {
    dl,
    caption:
      `• :･ﾟ⊹˚• \`『 TikTok-Download 』\` •˚⊹:･ﾟ•\n\n` +
      `ᰔᩚ *Título »* ${d.title || 'Sin título'}\n` +
      `ᰔᩚ *Autor »* @${d.author?.unique_id || d.author?.nickname || '?'}\n` +
      `ᰔᩚ *Likes »* ${(d.digg_count || 0).toLocaleString()}\n\n` +
      `> *${global.botname2} • ${global.dev}*`
  };
}

export default {
  command: ['tiktok', 'tt'],
  category: 'downloader',
  desc: 'Descarga o busca videos de TikTok',
  uso: '<url o texto>',
  run: async ({ msg, sock, args }) => {
    try {
      if (!args.length) return msg.reply('❍ Envía un enlace o un texto para buscar. Ej: *.tiktok* https://vt.tiktok.com/...');
      const url = args.find((a) => a.includes('tiktok.com'));

      if (url) {
        const v = await byUrl(url);
        if (!v) return msg.reply('❍ No se pudo descargar (verifica que el video sea público).');
        await sock.sendMessage(msg.chat, { video: { url: v.dl }, caption: v.caption }, { quoted: { key: msg.key, message: {} } });
        return;
      }

      const query = args.join(' ');
      await msg.reply(`> _Buscando *${query}* en TikTok, espera..._`);
      let videos = [];
      try {
        const res = await fetch(`https://www.tikwm.com/api/feed/search?keywords=${encodeURIComponent(query)}&count=10`, {
          headers: { 'User-Agent': UA, Referer: 'https://www.tikwm.com/' }
        });
        const json = await res.json();
        if (json?.code === 0 && Array.isArray(json?.data?.videos)) videos = json.data.videos;
      } catch (e) {
        console.error('[tiktok-search]', e?.message || e);
      }
      if (!videos.length) {
        return msg.reply('❍ Sin resultados (la búsqueda está limitada, envía el link directo del video).');
      }
      let n = 0;
      for (const v of videos.slice(0, 10)) {
        const dl = v?.play || v?.wmplay;
        if (!dl) continue;
        n++;
        await sock.sendMessage(
          msg.chat,
          { video: { url: dl }, caption: `ᰔᩚ *${n}.* @${v.author?.unique_id || v.author?.nickname || '?'}\n> ✦ ${v.title || 'Sin título'}` },
          { quoted: n === 1 ? { key: msg.key, message: {} } : undefined }
        );
      }
      if (!n) return msg.reply('❍ No se pudo descargar ningún resultado.');
    } catch (e) {
      console.error('[tiktok]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
