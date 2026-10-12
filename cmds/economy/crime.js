// .crime — crimen: 50/50 ganas o pierdes (cooldown 10min, estilo Alya).
import { getUser, saveUsers } from '../../lib/users.js';

export default {
  command: ['crime', 'crimen', 'delito'],
  category: 'economy',
  desc: 'Crimen: gana o pierde',
  run: async ({ msg }) => {
    try {
      const u = getUser(msg.sender);
      const queda = (u.crimeCooldown || 0) - Date.now();
      if (queda > 0) {
        const m = Math.floor(queda / 60000);
        return msg.reply(`❍ Escóndete *${m}m* antes del próximo golpe.`);
      }
      u.crimeCooldown = Date.now() + 10 * 60 * 1000;
      const n = Math.floor(Math.random() * 5000);
      let texto;
      if (Math.random() < 0.5) {
        u.coins = (u.coins || 0) + n;
        texto = `• :･ﾟ⊹˚• \`『 Crimen 』\` •˚⊹:･ﾟ•\n\n✿ *Golpe limpio »* +${n.toLocaleString()} ${global.moneda}\n\n> *${global.botname2} • ${global.dev}*`;
      } else {
        const pierde = Math.min(n, u.coins || 0);
        u.coins = (u.coins || 0) - pierde;
        texto = `• :･ﾟ⊹˚• \`『 Crimen 』\` •˚⊹:･ﾟ•\n\n✿ *Te atraparon »* -${pierde.toLocaleString()} ${global.moneda}\n\n> *${global.botname2} • ${global.dev}*`;
      }
      saveUsers();
      await msg.reply(texto);
    } catch {
      await msg.reply(global.msgglobal);
    }
  }
};
