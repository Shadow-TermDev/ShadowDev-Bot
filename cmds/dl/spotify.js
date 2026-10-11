// .sp — música por nombre: busca en YouTube y envía el audio (vía SaveTube).
// (La API de Spotify murió con Stellar; esto sí funciona.)
import ytsearch from 'yt-search';
import { downloadAudio } from '../../lib/ytdl.js';

export default {
  command: ['sp', 'spotify', 'musica'],
  category: 'downloader',
  desc: 'Busca y descarga música',
  uso: '<nombre de la canción>',
  run: async ({ msg, sock, args }) => {
    try {
      const query = args.join(' ').replace(/https?:\/\/\S+/g, '').trim() || args.join(' ');
      if (!query) return msg.reply('✎ Escribe el nombre de la canción. Ej: *.sp* get lucky');
      const search = await ytsearch(query);
      const video = search.videos?.[0];
      if (!video) return msg.reply('❖ Sin resultados.');
      await msg.reply(`➪ Descargando › *${video.title}*\n> _Enviando audio, espera..._`);
      const { dl } = await downloadAudio(video.url);
      await sock.sendMessage(
        msg.chat,
        { audio: { url: dl }, mimetype: 'audio/mpeg', fileName: `${video.title}.mp3` },
        { quoted: { key: msg.key, message: {} } }
      );
    } catch (e) {
      console.error('[sp]', e?.message || e);
      await msg.reply('❖ No se pudo descargar el audio.');
    }
  }
};
