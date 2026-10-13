// .topcount — top por mensajes.
import { displayName, todosUsuarios } from '../../lib/users.js';
import { baseJid } from '../../lib/grupo.js';

export default {
  command: ['topcount', 'topmsg', 'topmensajes'],
  category: 'info',
  desc: 'Top por mensajes',
  run: async ({ msg, sock }) => {
    try {
      let all = todosUsuarios().filter(([, u]) => (u.msgs || 0) > 0);
      if (msg.isGroup) {
        try {
          const meta = await sock.groupMetadata(msg.chat);
          const set = new Set((meta.participants || []).flatMap((p) => [p.id, p.lid, p.phoneNumber].filter(Boolean).map((x) => baseJid(x))));
          all = all.filter(([jid]) => set.has(baseJid(jid)));
        } catch {}
      }
      const top = [...all].sort((a, b) => (b[1].msgs || 0) - (a[1].msgs || 0)).slice(0, 10);
      if (!top.length) return msg.reply('❍ Sin datos aún.');
      const txt = top.map(([jid, u], i) => `${i + 1}. ${displayName(jid, u.apodo || u.name)} — ${u.msgs} msgs`).join('\n');
      await msg.reply(`• :･ﾟ⊹˚• \`『 Habladores 』\` •˚⊹:･ﾟ•\n\n${txt}\n\n> *${global.botname2} • ${global.dev}*`);
    } catch {
      await msg.reply(global.msgglobal);
    }
  }
};
