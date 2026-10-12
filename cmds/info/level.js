// .level — nivel por mensajes (1 nivel ≈ 50 msgs).
import { displayName, getUser } from '../../lib/users.js';

export default {
  command: ['level', 'lvl', 'nivel'],
  category: 'info',
  desc: 'Ver tu nivel',
  run: async ({ msg }) => {
    try {
      const who = (msg.mentionedJid || [])[0] || msg.quotedSender || msg.sender;
      const u = getUser(who);
      const lvl = Math.floor(Math.sqrt((u.msgs || 0) / 10));
      const base = lvl * lvl * 10;
      const next = (lvl + 1) * (lvl + 1) * 10;
      const pct = Math.min(100, Math.round(((u.msgs - base) / Math.max(1, next - base)) * 100));
      const barra = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(10 - Math.round(pct / 10));
      await msg.reply(
        `• :･ﾟ⊹˚• \`『 Nivel 』\` •˚⊹:･ﾟ•\n\n` +
        `✿ *Usuario »* ${displayName(who, who === msg.sender ? msg.pushName : u.apodo || u.name)}\n` +
        `✿ *Nivel »* ${lvl}\n` +
        `✿ *${pct}%* ${barra}\n` +
        `✿ *Mensajes »* ${u.msgs || 0} / ${next}\n\n` +
        `> *${global.botname2} • ${global.dev}*`
      );
    } catch {
      await msg.reply(global.msgglobal);
    }
  }
};
