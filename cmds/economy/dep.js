// .dep — deposita al banco (a salvo de robos).
import { getUser, saveUsers } from '../../lib/users.js';

export default {
  command: ['dep', 'd', 'deposit', 'depositar'],
  category: 'economy',
  desc: 'Deposita monedas al banco',
  uso: '<cantidad | all>',
  run: async ({ msg, args }) => {
    try {
      const u = getUser(msg.sender);
      let n = /all/i.test(args[0] || '') ? u.coins || 0 : Math.floor(Number(args[0]));
      if (!n || n <= 0) return msg.reply('❍ Cantidad inválida. Ej: *.dep 500* o *.dep all*');
      n = Math.min(n, u.coins || 0);
      if (n <= 0) return msg.reply('❍ No tienes nada para depositar.');
      u.coins -= n;
      u.bank = (u.bank || 0) + n;
      saveUsers();
      await msg.reply(`✿ Depositaste *${n.toLocaleString()} ${global.moneda}* en el banco, ya no podrán robártelo.`);
    } catch {
      await msg.reply(global.msgglobal);
    }
  }
};
