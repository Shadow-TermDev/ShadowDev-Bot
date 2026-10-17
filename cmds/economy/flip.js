// .flip — apuesta cara o cruz (estilo Alya).
import { getUser, saveUsers } from '../../lib/users.js';

export default {
  command: ['flip', 'apuesta', 'bet'],
  category: 'economy',
  desc: 'Apuesta a cara o cruz',
  uso: '<cara|cruz> <cantidad>',
  run: async ({ msg, args }) => {
    try {
      const lado = (args[0] || '').toLowerCase();
      const n = Math.floor(Number(args[1]));
      if (!['cara', 'cruz'].includes(lado) || !n || n <= 0) {
        return msg.reply('❍ Ej: *.flip cara 100*');
      }
      const u = getUser(msg.sender);
      if ((u.coins || 0) < n) return msg.reply(`❍ No tienes ${n.toLocaleString()} ${global.moneda}.`);
      const sale = Math.random() < 0.5 ? 'cara' : 'cruz';
      if (sale === lado) {
        u.coins += n;
        saveUsers();
        await msg.reply(`• :･ﾟ⊹˚• \`『 Flip 』\` •˚⊹:･ﾟ•\n\n✿ *Salió »* ${sale}\n✿ *Ganaste »* +${n.toLocaleString()} ${global.moneda}\n\n> *${global.botname2} • ${global.dev}*`);
      } else {
        u.coins -= n;
        saveUsers();
        await msg.reply(`• :･ﾟ⊹˚• \`『 Flip 』\` •˚⊹:･ﾟ•\n\n✿ *Salió »* ${sale}\n✿ *Perdiste »* -${n.toLocaleString()} ${global.moneda}\n\n> *${global.botname2} • ${global.dev}*`);
      }
    } catch (e) {
      console.error('[flip]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
