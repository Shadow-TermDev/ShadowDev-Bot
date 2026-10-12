// .top — más ricos y mejores colecciones.
import { displayName, todosUsuarios } from '../../lib/users.js';

export default {
  command: ['top', 'tops', 'ranking'],
  category: 'economy',
  desc: 'Tops de ricos y coleccionistas',
  run: async ({ msg, args }) => {
    try {
      const all = todosUsuarios().filter(([, u]) => (u.msgs || 0) > 0);
      if (!all.length) return msg.reply('❍ Aún no hay datos.');
      const ricos = [...all].sort((a, b) => ((b[1].coins || 0) + (b[1].bank || 0)) - ((a[1].coins || 0) + (a[1].bank || 0))).slice(0, 5);
      const col = [...all]
        .map(([jid, u]) => ({ jid, u, valor: (u.characters || []).reduce((n, c) => n + (c.value || 0), 0) }))
        .filter((x) => x.valor > 0)
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 5);
      const modo = (args[0] || '').toLowerCase();
      let out = `• :･ﾟ⊹˚• \`『 Tops 』\` •˚⊹:･ﾟ•\n`;
      if (modo !== 'coleccion') {
        out += `\n✿ *Ricos »*\n` + ricos.map(([jid, u], i) => `${i + 1}. ${displayName(jid, u.apodo || u.name)} — ${((u.coins || 0) + (u.bank || 0)).toLocaleString()} ${global.moneda}`).join('\n');
      }
      if (modo !== 'ricos' && col.length) {
        out += `\n\n✿ *Colecciones »*\n` + col.map((x, i) => `${i + 1}. ${displayName(x.jid, x.u.apodo || x.u.name)} — ${x.u.characters.length} pjs / ${x.valor.toLocaleString()} ${global.moneda}`).join('\n');
      }
      out += `\n\n> ✦ *.top ricos* / *.top coleccion*\n\n> *${global.botname2} • ${global.dev}*`;
      await msg.reply(out);
    } catch {
      await msg.reply(global.msgglobal);
    }
  }
};
