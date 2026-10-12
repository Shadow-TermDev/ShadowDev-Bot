// .claim — reclama el último personaje tirado en el chat.
import { addCoins, displayName, getUser, saveUsers } from '../../lib/users.js';
import { claimRoll } from '../../lib/gacha.js';

export default {
  command: ['claim', 'c', 'reclamar'],
  category: 'gacha',
  desc: 'Reclama el personaje actual',
  run: async ({ msg }) => {
    try {
      const r = claimRoll(msg.chat, msg.sender);
      if (!r) return msg.reply('❍ No hay nada para reclamar. Tira con *.rw*.');
      const u = getUser(msg.sender);
      if (!u.characters.some((c) => c.name === r.name)) u.characters.push({ name: r.name, source: r.source, value: r.value || 0 });
      const bonus = Math.floor((r.value || 0) / 10);
      if (bonus > 0) addCoins(msg.sender, bonus);
      saveUsers();
      await msg.reply(
        `• :･ﾟ⊹˚• \`『 Reclamado 』\` •˚⊹:･ﾟ•\n\n` +
        `✿ *Personaje »* ${r.name}\n` +
        `✿ *Dueño »* @${String(msg.sender).split('@')[0]} (${displayName(msg.sender, null)})\n` +
        (bonus > 0 ? `✿ *Bonus »* +${bonus.toLocaleString()} ${global.moneda}\n` : '') +
        `\n> *${global.botname2} • ${global.dev}*`,
        { mentions: [msg.sender] }
      );
    } catch (e) {
      console.error('[claim]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
