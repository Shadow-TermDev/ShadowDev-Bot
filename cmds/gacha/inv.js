// .inv — tus personajes reclamados.
import { displayName, getUser } from '../../lib/users.js';

export default {
  command: ['inv', 'inventario', 'mis', 'harem', 'waifus', 'claims'],
  category: 'gacha',
  desc: 'Ver tus personajes',
  run: async ({ msg }) => {
    try {
      const u = getUser(msg.sender);
      const chars = u.characters || [];
      if (!chars.length) return msg.reply('❍ Aún no tienes personajes. Tira con *.rw*.');
      const total = chars.reduce((n, c) => n + (c.value || 0), 0);
      const lista = chars.slice(0, 20).map((c, i) => `✿ *${i + 1}.* ${c.name} (${(c.value || 0).toLocaleString()} ${global.moneda})`).join('\n');
      await msg.reply(
        `• :･ﾟ⊹˚• \`『 ${displayName(msg.sender, msg.pushName)} 』\` •˚⊹:･ﾟ•\n\n${lista}\n` +
        (chars.length > 20 ? `\n> ✐ ...y ${chars.length - 20} más\n` : '') +
        `\n✿ *Total »* ${chars.length} personajes / ${total.toLocaleString()} ${global.moneda}\n\n> *${global.botname2} • ${global.dev}*`
      );
    } catch {
      await msg.reply(global.msgglobal);
    }
  }
};
