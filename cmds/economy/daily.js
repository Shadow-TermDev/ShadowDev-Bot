// .daily — recompensa diaria con RACHA: sube cada día seguido, se pierde si fallas.
import { getUser, saveUsers } from '../../lib/users.js';

const BASE = 1000;
const PASO = 250;
const MAX = 5000;
const DIA = 24 * 60 * 60 * 1000;

export default {
  command: ['daily', 'diario'],
  category: 'economy',
  desc: 'Recompensa diaria con racha',
  run: async ({ msg }) => {
    try {
      const u = getUser(msg.sender);
      const ahora = Date.now();
      const ultimo = u.lastDaily || 0;
      if (ahora - ultimo < DIA) {
        const queda = ultimo + DIA - ahora;
        const h = Math.floor(queda / 3600000);
        const m = Math.floor((queda % 3600000) / 60000);
        return msg.reply(`❍ Vuelve en *${h}h ${m}m* por tu daily (racha: ${u.dailyStreak || 0} días).`);
      }
      // ¿siguió la racha? (último daily hace 24-48h) si no, desde cero
      const racha = ultimo && ahora - ultimo < 2 * DIA ? (u.dailyStreak || 0) + 1 : 1;
      u.dailyStreak = racha;
      u.lastDaily = ahora;
      const premio = Math.min(BASE + (racha - 1) * PASO, MAX);
      u.coins = (u.coins || 0) + premio;
      saveUsers();
      await msg.reply(
        `• :･ﾟ⊹˚• \`『 Daily (día ${racha}) 』\` •˚⊹:･ﾟ•\n\n` +
        `✿ *Premio »* +${premio.toLocaleString()} ${global.moneda}\n` +
        (racha > 1 ? `✿ *Racha »* ${racha} días seguidos\n` : `> ✦ Vuelve mañana y sube a +${(BASE + PASO).toLocaleString()}\n`) +
        `\n> *${global.botname2} • ${global.dev}*`
      );
    } catch (e) {
      console.error('[daily]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
