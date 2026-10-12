// .waifu — imagen anime aleatoria (Stellar, gratis con key de prueba).
import fetch from 'node-fetch';

export default {
  command: ['waifu', 'neko', 'animeimg'],
  category: 'fun',
  desc: 'Imagen anime aleatoria',
  run: async ({ msg, sock }) => {
    try {
      const res = await fetch(`${global.api.url}/anime/waifu?key=${global.api.key}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 5000) throw new Error('vacía');
      await sock.sendMessage(
        msg.chat,
        { image: buf, caption: `✿ *Waifu*\n\n> *${global.botname2} • ${global.dev}*` },
        { quoted: { key: msg.key, message: {} } }
      );
      await msg.react('✔️');
    } catch (e) {
      console.error('[waifu]', e?.message || e);
      try {
        await msg.react('✖️');
      } catch {}
      await msg.reply(global.msgglobal);
    }
  }
};
