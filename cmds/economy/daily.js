// .daily — 1000 monedas cada 24h.
import { addCoins, getUser, saveUsers } from '../../lib/users.js';

const PREMIO = 1000;
const DIA = 24 * 60 * 60 * 1000;

export default {
  command: ['daily', 'diario'],
  category: 'economy',
  desc: 'Reclama 1000 monedas diarias',
  run: async ({ msg }) => {
    try {
      const u = getUser(msg.sender);
      const queda = (u.lastDaily || 0) + DIA - Date.now();
      if (queda > 0) {
        const h = Math.floor(queda / 3600000);
        const m = Math.floor((queda % 3600000) / 60000);
        return msg.reply(`❍ Vuelve en *${h}h ${m}m* por tu daily.`);
      }
      u.lastDaily = Date.now();
      const total = addCoins(msg.sender, PREMIO);
      saveUsers();
      await msg.reply(`• :･ﾟ⊹˚• \`『 Daily 』\` •˚⊹:･ﾟ•\n\n✿ *Premio »* +${PREMIO.toLocaleString()} moras\n✿ *Balance »* ${total.toLocaleString()} moras\n\n> *${global.botname2} • ${global.dev}*
> ${global.link}`);
    } catch {
      await msg.reply(global.msgglobal);
    }
  }
};
