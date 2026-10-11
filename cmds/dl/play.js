// .play — audio de YouTube vía API Stellar (reciclada de Hutao, funcional).
import fetch from 'node-fetch';
import ytsearch from 'yt-search';
import { getBuffer } from '../../lib/serialize.js';

export default {
  command: ['play', 'mp3', 'ytmp3', 'playaudio'],
  category: 'downloader',
  desc: 'Descarga audio de YouTube',
  uso: '<nombre o url>',
  run: async ({ msg, sock, args }) => {
    try {
      if (!args[0]) return msg.reply('《✧》Escribe el nombre o URL del video');
      const text = args.join(' ');
      const search = await ytsearch(text);
      const video = search.videos?.[0];
      if (!video) return msg.reply('《✧》No se encontró el video.');

      const caption =
        `【 ✿ 】 *${video.title}*\n\n` +
        `> ✐ Canal: ${video.author?.name || 'Desconocido'}\n` +
        `> ⴵ Duración: ${video.timestamp || ''}\n` +
        `> ✰ Vistas: ${(video.views || 0).toLocaleString()}\n\n` +
        `> _Enviando audio, espera..._`;
      try {
        const thumb = await getBuffer(video.image);
        await sock.sendMessage(msg.chat, { image: thumb, caption }, { quoted: { key: msg.key, message: {} } });
      } catch {
        await msg.reply(caption);
      }

      const dlUrl = `${global.api.url}/dl/ytmp3?url=${encodeURIComponent(video.url)}&key=${global.api.key}`;
      const res = await fetch(dlUrl).then((r) => r.json());
      if (!res?.status || !res.data?.dl) {
        return msg.reply('《✧》No se pudo descargar el audio. Verifica tu API key en settings.js');
      }
      await sock.sendMessage(
        msg.chat,
        { audio: { url: res.data.dl }, mimetype: 'audio/mpeg', fileName: `${video.title}.mp3` },
        { quoted: { key: msg.key, message: {} } }
      );
    } catch (e) {
      console.error('[play]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
