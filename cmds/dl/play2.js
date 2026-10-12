// .play2 — video de YouTube vía SaveTube (sin Stellar caído).
import ytsearch from 'yt-search';
import { downloadVideo, safeName } from '../../lib/ytdl.js';

export default {
  command: ['play2', 'mp4', 'ytmp4', 'playvideo'],
  category: 'downloader',
  desc: 'Baja video en MP4',
  uso: '<nombre o url>',
  run: async ({ msg, sock, args }) => {
    try {
      if (!args[0]) return msg.reply('❍ Escribe el nombre o URL del video.');
      const search = await ytsearch(args.join(' '));
      const video = search.videos?.[0];
      if (!video) return msg.reply('❍ No se encontró el video.');
      await msg.react('🕒');
      const dlP = downloadVideo(video.url);
      await msg.reply(`> ✐ _Enviando video *${video.title}*, espera..._`);
      const { dl } = await dlP;
      const name = safeName(video.title, 'video');
      const caption =
        `• :･ﾟ⊹˚• \`『 YouTube-Video 』\` •˚⊹:･ﾟ•\n\n` +
        `✿ *Título »* ${video.title}\n` +
        `✿ *Canal »* ${video.author?.name || 'Desconocido'}\n\n` +
        `> *${global.botname2} • ${global.dev}*
> ${global.link}`;

      // Videos pesados van como documento (tu red los tumba como video)
      let big = false;
      try {
        const head = await fetch(dl, { method: 'HEAD', signal: AbortSignal.timeout(15000) });
        big = (parseInt(head.headers.get('content-length') || '0', 10) || 0) > 95 * 1024 * 1024;
      } catch {}
      if (big) {
        await sock.sendMessage(
          msg.chat,
          { document: { url: dl }, fileName: `${name}.mp4`, mimetype: 'video/mp4', caption },
          { quoted: { key: msg.key, message: {} } }
        );
      } else {
        await sock.sendMessage(
          msg.chat,
          { video: { url: dl }, caption },
          { quoted: { key: msg.key, message: {} } }
        );
      }
    } catch (e) {
      console.error('[play2]', e?.message || e);
      try { await msg.react('✖️'); } catch {}
      await msg.reply('❍ No se pudo descargar el video, intenta con otro tema.');
    }
  }
};
