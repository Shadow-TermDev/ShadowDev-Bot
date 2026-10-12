// .playaudio — audio como nota de reproductor (no documento).
import ytsearch from 'yt-search';
import { downloadAudio } from '../../lib/ytdl.js';

export default {
  command: ['playaudio', 'ytaudio', 'audio'],
  category: 'downloader',
  desc: 'Audio como reproductor',
  uso: '<nombre o url>',
  run: async ({ msg, sock, args }) => {
    try {
      if (!args[0]) return msg.reply('❍ Escribe el nombre o URL del video.');
      const search = await ytsearch(args.join(' '));
      const video = search.videos?.[0];
      if (!video) return msg.reply('❍ No se encontró el video.');
      if ((video.seconds || 0) > 1800) return msg.reply('❍ Muy largo (máx 30 min). Busca otro tema.');
      const dlP = downloadAudio(video.url);
      await msg.reply(`> ✦ _Enviando audio *${video.title}*, espera..._`);
      const { dl } = await dlP;
      await sock.sendMessage(
        msg.chat,
        { audio: { url: dl }, mimetype: 'audio/mpeg', ptt: false },
        { quoted: { key: msg.key, message: {} } }
      );
      await msg.react('✔️');
    } catch (e) {
      console.error('[playaudio]', e?.message || e);
      try {
        await msg.react('✖️');
      } catch {}
      await msg.reply('❍ No se pudo descargar el audio, intenta con otro tema.');
    }
  }
};
