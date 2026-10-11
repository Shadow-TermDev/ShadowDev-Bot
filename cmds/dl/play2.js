// .play2 — video de YouTube vía API Stellar.
import fetch from 'node-fetch';
import ytsearch from 'yt-search';
import { getBuffer } from '../../lib/serialize.js';

export default {
  command: ['play2', 'mp4', 'ytmp4', 'playvideo'],
  category: 'downloader',
  desc: 'Descarga video de YouTube',
  uso: '<nombre o url>',
  run: async ({ msg, sock, args }) => {
    try {
      if (!args[0]) return msg.reply('《✧》Escribe el nombre o URL del video');
      const search = await ytsearch(args.join(' '));
      const video = search.videos?.[0];
      if (!video) return msg.reply('《✧》No se encontró el video.');

      await msg.reply(`> _Enviando video *${video.title}*, espera..._`);
      const dlUrl = `${global.api.url}/dl/ytmp4?url=${encodeURIComponent(video.url)}&quality=auto&key=${global.api.key}`;
      const res = await fetch(dlUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }).then((r) => r.json());
      const dl = res?.result?.downloadUrl || res?.data?.dl;
      if (!res?.status || !dl) {
        return msg.reply('《✧》No se pudo descargar el video. Verifica tu API key en settings.js');
      }
      await sock.sendMessage(
        msg.chat,
        { video: { url: dl }, fileName: `${video.title}.mp4`, mimetype: 'video/mp4' },
        { quoted: { key: msg.key, message: {} } }
      );
    } catch (e) {
      console.error('[play2]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
