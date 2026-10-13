// .weekly — 5000 cada 7 días.
import { getUser, saveUsers } from '../../lib/users.js';

const PREMIO = 5000;
const SEMANA = 7 * 24 * 60 * 60 * 1000;

export default {
  command: ['weekly', 'semanal'],
  category: 'economy',
  desc: 'Recompensa semanal',
  run: async ({ msg }) => {
    try {
      const u = getUser(msg.sender);
      const queda = (u.lastWeekly || 0) + SEMANA - Date.now();
      if (queda > 0) {
        const d = Math.floor(queda / 86400000);
        const h = Math.floor((queda % 86400000) / 3600000);
        return msg.reply(`❍ Vuelve en *${d}d ${h}h* por tu weekly.`);
      }
      u.lastWeekly = Date.now();
      u.coins = (u.coins || 0) + PREMIO;
      saveUsers();
      await msg.reply(`• :･ﾟ⊹˚• \`『 Weekly 』\` •˚⊹:･ﾟ•\n\n✿ *Premio »* +${PREMIO.toLocaleString()} ${global.moneda}\n\n> *${global.botname2} • ${global.dev}*`);
    } catch {
      await msg.reply(global.msgglobal);
    }
  }
};
