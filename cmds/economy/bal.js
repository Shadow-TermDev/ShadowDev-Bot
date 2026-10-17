// .bal — dinero, banco y total (menciona o cita para ver otro).
import { displayName, existeUser, getUser } from '../../lib/users.js';

export default {
  command: ['bal', 'balance', 'coins', 'monedas', 'bank', 'banco'],
  category: 'economy',
  desc: 'Ver dinero, banco y total',
  run: async ({ msg }) => {
    try {
      const who = (msg.mentionedJid || [])[0] || (msg.quotedSender || null) || msg.sender;
      if (who !== msg.sender && !existeUser(who)) {
        return msg.reply('❍ Esa persona aún no usa el bot (no tiene cuenta).');
      }
      const u = getUser(who);
      const nombre = displayName(who, who === msg.sender ? msg.pushName : u.apodo || u.name);
      const total = (u.coins || 0) + (u.bank || 0);
      await msg.reply(
        `✿ *》》Economía ${nombre}《《* ✿\n\n` +
        `✿ *Dinero »* ${(u.coins || 0).toLocaleString()} ${global.moneda}\n` +
        `✿ *Banco »* ${(u.bank || 0).toLocaleString()} ${global.moneda}\n` +
        `✿ *Total »* ${total.toLocaleString()} ${global.moneda}\n\n` +
        `> _Protege tu dinero en el banco con *.dep*_`
      );
    } catch (e) {
      console.error('[bal]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
