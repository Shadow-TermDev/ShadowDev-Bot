// .rob — roba dinero (no del banco). Solo a inactivos 1h+, cooldown 30min.
import { displayName, existeUser, getUser, saveUsers } from '../../lib/users.js';

const MIN = 50;
const CD = 30 * 60 * 1000;
const HORA = 60 * 60 * 1000;

export default {
  command: ['rob', 'robar', 'steal'],
  category: 'economy',
  desc: 'Roba monedas a alguien',
  uso: '<@mención>',
  run: async ({ msg, sock }) => {
    try {
      const target = (msg.mentionedJid || [])[0] || msg.quotedSender || null;
      if (!target || target === msg.sender) return msg.reply(`❍ Menciona a quién robarle ${global.moneda}.`);
      if (!existeUser(target)) return msg.reply('❍ Esa persona aún no usa el bot (no tiene cuenta).');
      const yo = getUser(msg.sender);
      const el = getUser(target);
      if (Date.now() - (el.lastSeen || 0) < HORA) {
        return msg.reply('❍ Solo puedes robar a inactivos (1 hora sin aparecer).');
      }
      if ((el.coins || 0) < MIN) {
        return msg.reply(`❍ *${displayName(target)}* no tiene suficientes ${global.moneda}.`);
      }
      const queda = (yo.lastRob || 0) + CD - Date.now();
      if (queda > 0) {
        const m = Math.ceil(queda / 60000);
        return msg.reply(`❍ Espera *${m}m* antes de robar de nuevo.`);
      }
      yo.lastRob = Date.now();
      const n = Math.min(Math.floor(Math.random() * 5000) + MIN, el.coins);
      el.coins -= n;
      yo.coins = (yo.coins || 0) + n;
      saveUsers();
      await sock.sendMessage(
        msg.chat,
        { text: `✐ Le robaste *${n.toLocaleString()} ${global.moneda}* a *@${String(target).split('@')[0]}*.`, mentions: [target] },
        { quoted: { key: msg.key, message: {} } }
      );
    } catch (e) {
      console.error('[rob]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
