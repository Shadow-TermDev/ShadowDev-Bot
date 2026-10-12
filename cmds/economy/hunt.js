// .hunt — caza recompensas (cooldown 10min).
import { getUser, saveUsers } from '../../lib/users.js';

const PRESAS = ['conejo', 'venado', 'jabalí', 'zorro', 'oso pequeño', 'pato'];

export default {
  command: ['hunt', 'cazar', 'caza'],
  category: 'economy',
  desc: 'Caza por monedas',
  run: async ({ msg }) => {
    try {
      const u = getUser(msg.sender);
      const queda = (u.huntCooldown || 0) - Date.now();
      if (queda > 0) return msg.reply(`❍ El bosque descansa *${Math.ceil(queda / 60000)}m*.`);
      const presa = PRESAS[Math.floor(Math.random() * PRESAS.length)];
      const n = Math.floor(Math.random() * 3500) + 800;
      u.huntCooldown = Date.now() + 10 * 60 * 1000;
      u.coins = (u.coins || 0) + n;
      saveUsers();
      await msg.reply(`• :･ﾟ⊹˚• \`『 Caza 』\` •˚⊹:･ﾟ•\n\n✿ *Cazaste »* ${presa}\n✿ *Vale »* +${n.toLocaleString()} ${global.moneda}\n\n> *${global.botname2} • ${global.dev}*`);
    } catch {
      await msg.reply(global.msgglobal);
    }
  }
};
