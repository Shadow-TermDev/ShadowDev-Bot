// .work — trabaja por monedas (cooldown 10min, estilo Alya).
import { getUser, saveUsers } from '../../lib/users.js';

const TRABAJOS = ['programador', 'minero', 'pescador', 'artista', 'repartidor', 'mecánico'];

export default {
  command: ['work', 'trabajar', 'chamba'],
  category: 'economy',
  desc: 'Trabaja por monedas',
  run: async ({ msg }) => {
    try {
      const u = getUser(msg.sender);
      const queda = (u.workCooldown || 0) - Date.now();
      if (queda > 0) {
        const m = Math.floor(queda / 60000);
        const s = Math.floor((queda % 60000) / 1000);
        return msg.reply(`❍ Descansa *${m}m ${s}s* antes de trabajar.`);
      }
      const pago = Math.floor(Math.random() * 5000);
      const oficio = TRABAJOS[Math.floor(Math.random() * TRABAJOS.length)];
      u.workCooldown = Date.now() + 10 * 60 * 1000;
      u.coins = (u.coins || 0) + pago;
      saveUsers();
      await msg.reply(`• :･ﾟ⊹˚• \`『 Trabajo 』\` •˚⊹:･ﾟ•\n\n✿ *Oficio »* ${oficio}\n✿ *Ganaste »* +${pago.toLocaleString()} ${global.moneda}\n\n> *${global.botname2} • ${global.dev}*`);
    } catch {
      await msg.reply(global.msgglobal);
    }
  }
};
