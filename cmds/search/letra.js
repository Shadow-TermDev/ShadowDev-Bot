// .letra — letra de canciones vía lrclib (gratis, sin key).
import fetch from 'node-fetch';

export default {
  command: ['letra', 'lyrics', 'lyric'],
  category: 'search',
  desc: 'Letra de cualquier canción',
  uso: '<nombre>',
  run: async ({ msg, sock, args }) => {
    try {
      const q = args.join(' ');
      if (!q) return msg.reply('❍ Escribe el nombre. Ej: *.letra* despacito');
      const res = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(q)}`).then((r) => r.json());
      const hit = (res || []).find((x) => x.plainLyrics) || res?.[0];
      if (!hit?.plainLyrics) return msg.reply('❍ Sin letra para eso.');
      const letra = hit.plainLyrics.slice(0, 3000);
      await sock.sendMessage(
        msg.chat,
        { text: `• :･ﾟ⊹˚• \`『 Letra 』\` •˚⊹:･ﾟ•\n\nᰔᩚ *Tema »* ${hit.trackName || q}\nᰔᩚ *Artista »* ${hit.artistName || '?'}\n\n${letra}\n\n> *${global.botname2} • ${global.dev}*` },
        { quoted: { key: msg.key, message: {} } }
      );
    } catch (e) {
      console.error('[letra]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
