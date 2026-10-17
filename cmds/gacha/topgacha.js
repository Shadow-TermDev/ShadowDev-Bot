// .topgacha — mejores colecciones.
import { displayName, todosUsuarios } from '../../lib/users.js';
import { baseJid } from '../../lib/grupo.js';

export default {
  command: ['topgacha', 'topcoleccion', 'topclaims'],
  category: 'gacha',
  desc: 'Top de coleccionistas',
  run: async ({ msg, sock }) => {
    try {
      let all = todosUsuarios();
      if (msg.isGroup) {
        try {
          const meta = await sock.groupMetadata(msg.chat);
          const set = new Set((meta.participants || []).flatMap((p) => [p.id, p.lid, p.phoneNumber].filter(Boolean).map((x) => baseJid(x))));
          all = all.filter(([jid]) => set.has(baseJid(jid)));
        } catch {}
      }
      const col = all
        .map(([jid, u]) => ({ jid, u, valor: (u.characters || []).reduce((n, c) => n + (c.value || 0), 0) }))
        .filter((x) => (x.u.characters || []).length > 0)
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 10);
      if (!col.length) return msg.reply('❍ Nadie tiene personajes aún. Tira con *.rw*.');
      const txt = col.map((x, i) => `${i + 1}. ${displayName(x.jid, x.u.apodo || x.u.name)} — ${x.u.characters.length} pjs / ${x.valor.toLocaleString()} ${global.moneda}`).join('\n');
      await msg.reply(`• :･ﾟ⊹˚• \`『 Coleccionistas 』\` •˚⊹:･ﾟ•\n\n${txt}\n\n> ✦ Mira dinero con *.top*\n\n> *${global.botname2} • ${global.dev}*`);
    } catch (e) {
      console.error('[topgacha]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
