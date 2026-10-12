// .roulette — ruleta rojo/negro (apuesta doble o nada).
import { getUser, saveUsers } from '../../lib/users.js';

export default {
  command: ['roulette', 'rt', 'ruleta'],
  category: 'economy',
  desc: 'Apuesta a rojo o negro',
  uso: '<rojo|negro> <cantidad>',
  run: async ({ msg, args }) => {
    try {
      const lado = (args[0] || '').toLowerCase();
      const n = Math.floor(Number(args[1]));
      if (!['rojo', 'negro', 'red', 'black'].includes(lado) || !n || n <= 0) {
        return msg.reply('❍ Ej: *.roulette rojo 100*');
      }
      const pick = ['rojo', 'negro'].includes(lado) ? lado : lado === 'red' ? 'rojo' : 'negro';
      const u = getUser(msg.sender);
      if ((u.coins || 0) < n) return msg.reply(`❍ No tienes ${n.toLocaleString()} ${global.moneda}.`);
      const sale = Math.random() < 0.5 ? 'rojo' : 'negro';
      if (sale === pick) {
        u.coins += n;
        saveUsers();
        await msg.reply(`• :･ﾟ⊹˚• \`『 Ruleta 』\` •˚⊹:･ﾟ•\n\n✿ *Salió »* ${sale}\n✿ *Ganaste »* +${n.toLocaleString()} ${global.moneda}\n\n> *${global.botname2} • ${global.dev}*`);
      } else {
        u.coins -= n;
        saveUsers();
        await msg.reply(`• :･ﾟ⊹˚• \`『 Ruleta 』\` •˚⊹:･ﾟ•\n\n✿ *Salió »* ${sale}\n✿ *Perdiste »* -${n.toLocaleString()} ${global.moneda}\n\n> *${global.botname2} • ${global.dev}*`);
      }
    } catch {
      await msg.reply(global.msgglobal);
    }
  }
};
