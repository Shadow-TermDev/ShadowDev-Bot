// .claim — reclama el último personaje tirado en el chat.
import { addCoins, displayName, getUser } from '../../lib/users.js';
import { claimRoll, duenoDe, quitarPersonaje } from '../../lib/gacha.js';

export default {
  command: ['claim', 'c', 'reclamar'],
  category: 'gacha',
  desc: 'Reclama el personaje actual',
  run: async ({ msg }) => {
    try {
      const r = claimRoll(msg.chat, msg.sender);
      if (!r) return msg.reply('❍ No hay nada para reclamar (o ya es tuyo). Tira con *.rw*.');
      const u = getUser(msg.sender);
      const yaMio = (u.characters || []).some((c) => c.name === r.name);
      const dueno = duenoDe(r.name);
      let transferidoDe = null;
      if (!yaMio && dueno && dueno.jid !== msg.sender) {
        quitarPersonaje(dueno.jid, r.name);
        transferidoDe = dueno;
      }
      if (!yaMio) u.characters.push({ name: r.name, source: r.source, value: r.value || 0 });
      const bonus = yaMio || transferidoDe ? 0 : Math.floor((r.value || 0) / 10);
      if (bonus > 0) addCoins(msg.sender, bonus);
      await msg.reply(
        `• :･ﾟ⊹˚• \`『 Reclamado 』\` •˚⊹:･ﾟ•\n\n` +
        `✿ *Personaje »* ${r.name}\n` +
        `✿ *Dueño »* @${String(msg.sender).split('@')[0]} (${displayName(msg.sender, null)})\n` +
        (transferidoDe ? `✿ *Antes de »* ${transferidoDe.nombre}\n` : '') +
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
