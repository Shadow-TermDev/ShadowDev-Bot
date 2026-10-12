// .topcount — top por mensajes.
import { displayName, todosUsuarios } from '../../lib/users.js';

export default {
  command: ['topcount', 'topmsg', 'topmensajes'],
  category: 'info',
  desc: 'Top por mensajes',
  run: async ({ msg }) => {
    try {
      const all = todosUsuarios()
        .filter(([, u]) => (u.msgs || 0) > 0)
        .sort((a, b) => (b[1].msgs || 0) - (a[1].msgs || 0))
        .slice(0, 10);
      if (!all.length) return msg.reply('❍ Sin datos aún.');
      const txt = all.map(([jid, u], i) => `${i + 1}. ${displayName(jid, u.apodo || u.name)} — ${u.msgs} msgs`).join('\n');
      await msg.reply(`• :･ﾟ⊹˚• \`『 Habladores 』\` •˚⊹:･ﾟ•\n\n${txt}\n\n> *${global.botname2} • ${global.dev}*`);
    } catch {
      await msg.reply(global.msgglobal);
    }
  }
};
