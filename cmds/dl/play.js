// .play — audio de YouTube con título y portada (estilo Megumin, vía SaveTube).
import ytsearch from 'yt-search';
import { getBuffer } from '../../lib/serialize.js';
import { downloadAudio, safeName, tagAudio } from '../../lib/ytdl.js';

export default {
  command: ['play', 'mp3', 'ytmp3'],
  category: 'downloader',
  desc: 'Baja audio en MP3 con portada',
  uso: '<nombre o url>',
  run: async ({ msg, sock, args }) => {
    try {
      if (!args[0]) return msg.reply('❍ Escribe el nombre o URL del video.');
      const search = await ytsearch(args.join(' '));
      const video = search.videos?.[0];
      if (!video) return msg.reply('❍ No se encontró el video.');
      const canal = video.author?.name || 'Desconocido';

      const caption =
        `• :･ﾟ⊹˚• \`『 YouTube-Music 』\` •˚⊹:･ﾟ•\n\n` +
        `ᰔᩚ *Título »* ${video.title}\n` +
        `ᰔᩚ *Canal »* ${canal}\n` +
        `ᰔᩚ *Duración »* ${video.timestamp || ''}\n` +
        `ᰔᩚ *Vistas »* ${(video.views || 0).toLocaleString()}\n\n` +
        `> ✦ _Enviando audio, espera..._\n` +
        `> *${global.botname2} • ${global.dev}*`;
      // La descarga arranca ANTES del aviso: se solapan y se ahorra ~2s
      const dlP = downloadAudio(video.url);
      let thumb = null;
      try {
        thumb = await getBuffer(video.image);
        await sock.sendMessage(msg.chat, { image: thumb, caption }, { quoted: { key: msg.key, message: {} } });
      } catch {
        await msg.reply(caption);
      }

      const { dl } = await dlP;
      let audio = await getBuffer(dl);
      audio = await tagAudio(audio, { title: video.title, artist: canal, cover: thumb });

      await sock.sendMessage(
        msg.chat,
        {
          document: audio,
          mimetype: 'audio/mpeg',
          fileName: `${safeName(video.title)}.mp3`,
          jpegThumbnail: thumb ?? undefined
        },
        { quoted: { key: msg.key, message: {} } }
      );
    } catch (e) {
      console.error('[play]', e?.message || e);
      await msg.reply('❍ No se pudo descargar el audio, intenta con otro tema.');
    }
  }
};
