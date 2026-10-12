// .mine — mina monedas (cooldown 10min).
import { getUser, saveUsers } from '../../lib/users.js';

export default {
  command: ['mine', 'minar', 'mina'],
  category: 'economy',
  desc: 'Mina monedas',
  run: async ({ msg }) => {
    try {
      const u = getUser(msg.sender);
      const queda = (u.mineCooldown || 0) - Date.now();
      if (queda > 0) return msg.reply(`❍ La mina descansa *${Math.ceil(queda / 60000)}m*.`);
      const n = Math.floor(Math.random() * 4000) + 1000;
      u.mineCooldown = Date.now() + 10 * 60 * 1000;
      u.coins = (u.coins || 0) + n;
      saveUsers();
      await msg.reply(`• :･ﾟ⊹˚• \`『 Mina 』\` •˚⊹:･ﾟ•\n\n✿ *Encontraste »* +${n.toLocaleString()} ${global.moneda}\n\n> *${global.botname2} • ${global.dev}*`);
    } catch {
      await msg.reply(global.msgglobal);
    }
  }
};
