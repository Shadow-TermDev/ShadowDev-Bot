// .waifu — imagen anime aleatoria (Stellar con rotación de keys).
import { sbuffer } from '../../lib/stellar.js';

export default {
  command: ['waifu', 'neko', 'animeimg'],
  category: 'fun',
  desc: 'Imagen anime aleatoria',
  run: async ({ msg, sock }) => {
    try {
      const buf = await sbuffer('/anime/waifu');
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
