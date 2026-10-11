// .sp — música por nombre con título y portada (vía YouTube + SaveTube).
import ytsearch from 'yt-search';
import { getBuffer } from '../../lib/serialize.js';
import { downloadAudio, tagAudio } from '../../lib/ytdl.js';

export default {
  command: ['sp', 'spotify', 'musica'],
  category: 'downloader',
  desc: 'Busca y descarga música',
  uso: '<nombre de la canción>',
  run: async ({ msg, sock, args }) => {
    try {
      const query = args.join(' ').replace(/https?:\/\/\S+/g, '').trim() || args.join(' ');
      if (!query) return msg.reply('❍ Escribe el nombre de la canción. Ej: *.sp* get lucky');
      const search = await ytsearch(query);
      const video = search.videos?.[0];
      if (!video) return msg.reply('❖ Sin resultados.');
      const canal = video.author?.name || 'Desconocido';
      await msg.reply(`• :･ﾟ⊹˚• \`『 Music 』\` •˚⊹:･ﾟ•\n\nᰔᩚ *Título »* ${video.title}\nᰔᩚ *Artista »* ${canal}\n\n> ✦ _Enviando audio, espera..._`);
      const { dl } = await downloadAudio(video.url);
      let audio = await getBuffer(dl);
      let thumb = null;
      try {
        thumb = await getBuffer(video.image);
      } catch {}
      audio = await tagAudio(audio, { title: video.title, artist: canal, cover: thumb });
      await sock.sendMessage(
        msg.chat,
        {
          document: audio,
          mimetype: 'audio/mpeg',
          fileName: `${video.title}.mp3`,
          jpegThumbnail: thumb ?? undefined
        },
        { quoted: { key: msg.key, message: {} } }
      );
    } catch (e) {
      console.error('[sp]', e?.message || e);
      await msg.reply('❖ No se pudo descargar el audio.');
    }
  }
};
