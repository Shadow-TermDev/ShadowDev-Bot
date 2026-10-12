// .pinterest — busca imágenes (Stellar con rotación de keys).
import { sfetch } from '../../lib/stellar.js';

export default {
  command: ['pinterest', 'pin', 'pins'],
  category: 'search',
  desc: 'Busca imágenes en Pinterest',
  uso: '<texto>',
  run: async ({ msg, sock, args }) => {
    try {
      const q = args.join(' ');
      if (!q) return msg.reply('❍ Escribe qué buscar. Ej: *.pinterest* gatos');
      await msg.react('🕒');
      const res = await sfetch(`/search/pinterest?query=${encodeURIComponent(q)}`);
      const arr = Array.isArray(res?.data) ? res.data : [];
      const imgs = arr.map((x) => x?.hd || x?.mini).filter(Boolean).slice(0, 5);
      if (!imgs.length) return msg.reply('❍ Sin resultados.');
      for (const u of imgs) {
        await sock.sendMessage(msg.chat, { image: { url: u }, caption: `✿ *${q}*\n\n> *${global.botname2} • ${global.dev}*` }, { quoted: { key: msg.key, message: {} } });
      }
      await msg.react('✔️');
    } catch (e) {
      console.error('[pinterest]', e?.message || e);
      try {
        await msg.react('✖️');
      } catch {}
      await msg.reply(global.msgglobal);
    }
  }
};
