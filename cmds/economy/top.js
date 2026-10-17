// .top — los más ricos (dinero + banco).
import { displayName, todosUsuarios } from '../../lib/users.js';
import { baseJid } from '../../lib/grupo.js';

export default {
  command: ['top', 'ricos', 'millonarios'],
  category: 'economy',
  desc: 'Top de más ricos',
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
      if (!all.length) return msg.reply('❍ Aún no hay datos.');
      const ricos = [...all]
        .sort((a, b) => ((b[1].coins || 0) + (b[1].bank || 0)) - ((a[1].coins || 0) + (a[1].bank || 0)))
        .slice(0, 10);
      const txt = ricos.map(([jid, u], i) => `${i + 1}. ${displayName(jid, u.apodo || u.name)} — ${((u.coins || 0) + (u.bank || 0)).toLocaleString()} ${global.moneda}`).join('\n');
      await msg.reply(`• :･ﾟ⊹˚• \`『 Ricos 』\` •˚⊹:･ﾟ•\n\n${txt}\n\n> ✦ Mira colecciones con *.topgacha*\n\n> *${global.botname2} • ${global.dev}*`);
    } catch (e) {
      console.error('[top]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
