// .sp — Spotify: busca y descarga el audio (reciclado de Hutao, sin sharp).
import fetch from 'node-fetch';

export default {
  command: ['sp', 'spotify'],
  category: 'downloader',
  desc: 'Busca y descarga música de Spotify',
  uso: '<nombre o url>',
  run: async ({ msg, sock, args }) => {
    try {
      const query = args.join(' ');
      if (!query) return msg.reply('✎ Escribe el nombre o URL de la canción.');
      let url = query;
      let info = null;
      if (!/open\.spotify\.com\/track\//i.test(query)) {
        const s = await fetch(`${global.api.url}/search/spotify?query=${encodeURIComponent(query)}&key=${global.api.key}`).then((r) => r.json());
        if (!s?.status || !s.data?.length) return msg.reply('❖ Sin resultados en Spotify.');
        info = s.data[0];
        url = info.url;
      }
      if (!info) {
        const r = await fetch(`${global.api.url}/dl/spotify?url=${encodeURIComponent(url)}&key=${global.api.key}`).then((x) => x.json());
        info = r?.data || {};
      }
      await msg.reply(`➪ Descargando › ${info.title || info.name || query}\n> ✿ Artista: ${info.artist || ''}\n> _Enviando audio, espera..._`);
      const a = await fetch(`${global.api.url}/dl/spotify?url=${encodeURIComponent(url)}&key=${global.api.key}`).then((r) => r.json());
      if (!a?.status || !a.data?.dl) return msg.reply('❖ No se pudo descargar el audio.');
      await sock.sendMessage(
        msg.chat,
        { audio: { url: a.data.dl }, mimetype: 'audio/mpeg', fileName: `${a.data.title || 'music'}.mp3` },
        { quoted: { key: msg.key, message: {} } }
      );
    } catch (e) {
      console.error('[sp]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
