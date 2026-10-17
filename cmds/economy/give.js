// .give — regala monedas a alguien.
import { displayName, existeUser, getUser, saveUsers } from '../../lib/users.js';
import { esBot } from '../../lib/grupo.js';

export default {
  command: ['give', 'dar', 'regalarcoins', 'donar'],
  category: 'economy',
  desc: 'Regala monedas a alguien',
  uso: '<@usuario> <cantidad>',
  run: async ({ msg, sock, args }) => {
    try {
      const target = (msg.mentionedJid || [])[0] || msg.quotedSender || null;
      const n = Math.floor(Number(args.find((a) => /^\d+$/.test(a))));
      if (!target || target === msg.sender) return msg.reply('❍ Menciona a quién. Ej: *.give* @amigo 100');
      if (esBot(sock, target)) return msg.reply('❍ No puedes darle cosas al bot.');
      if (!n || n <= 0) return msg.reply('❍ Cantidad inválida.');
      const yo = getUser(msg.sender);
      if ((yo.coins || 0) < n) return msg.reply(`❍ No tienes ${n.toLocaleString()} ${global.moneda}.`);
      if (!existeUser(target)) return msg.reply('❍ Esa persona aún no usa el bot (no tiene cuenta).');
      yo.coins -= n;
      const otro = getUser(target);
      otro.coins = (otro.coins || 0) + n;
      saveUsers();
      await sock.sendMessage(
        msg.chat,
        { text: `✿ *${displayName(msg.sender, msg.pushName)}* le dio *${n.toLocaleString()} ${global.moneda}* a *@${String(target).split('@')[0]}*`, mentions: [target] },
        { quoted: { key: msg.key, message: {} } }
      );
    } catch (e) {
      console.error('[give]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
