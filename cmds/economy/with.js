// .with — retira del banco.
import { getUser, saveUsers } from '../../lib/users.js';

export default {
  command: ['with', 'withdraw', 'retirar', 'sacar'],
  category: 'economy',
  desc: 'Retira monedas del banco',
  uso: '<cantidad | all>',
  run: async ({ msg, args }) => {
    try {
      const u = getUser(msg.sender);
      let n = /^all$/i.test(args[0] || '') ? u.bank || 0 : Math.floor(Number(args[0]));
      if (!n || n <= 0) return msg.reply('❍ Cantidad inválida. Ej: *.with 500* o *.with all*');
      n = Math.min(n, u.bank || 0);
      if (n <= 0) return msg.reply('❍ Tu banco está vacío.');
      u.bank -= n;
      u.coins = (u.coins || 0) + n;
      saveUsers();
      await msg.reply(`✿ Retiraste *${n.toLocaleString()} ${global.moneda}* del banco.`);
    } catch (e) {
      console.error('[with]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
