// .bal — tus monedas.
import { getUser } from '../../lib/users.js';

export default {
  command: ['bal', 'balance', 'coins', 'monedas'],
  category: 'economy',
  desc: 'Ver tus monedas',
  run: async ({ msg }) => {
    try {
      const u = getUser(msg.sender);
      await msg.reply(`• :･ﾟ⊹˚• \`『 Balance 』\` •˚⊹:･ﾟ•\n\n✿ *Monedas »* ${(u.coins || 0).toLocaleString()} 🪙\n\n> *${global.botname2} • ${global.dev}*`);
    } catch {
      await msg.reply(global.msgglobal);
    }
  }
};
