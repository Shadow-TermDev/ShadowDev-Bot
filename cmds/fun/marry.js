// .marry — propón matrimonio; si te lo proponen de vuelta en 10min, casados.
import { displayName, getUser, saveUsers } from '../../lib/users.js';

export default {
  command: ['marry', 'casarse', 'boda'],
  category: 'fun',
  desc: 'Cásate con alguien',
  uso: '<@mención>',
  run: async ({ msg, sock, args }) => {
    try {
      const target = (msg.mentionedJid || [])[0] || msg.quotedSender || null;
      if (!target || target === msg.sender) return msg.reply('❍ Menciona con quién. Ej: *.marry* @amor');
      const yo = getUser(msg.sender);
      const el = getUser(target);
      if (yo.spouse === target) return msg.reply('❍ Ya están casados. Usa *.divorce* si quieres separarte.');
      if (yo.spouse && yo.spouse !== target) return msg.reply(`❍ Ya estás casado con *@${String(yo.spouse).split('@')[0]}*. Divórciate con *.divorce*.`);
      if (el.spouse && el.spouse !== msg.sender) return msg.reply(`❍ *@${String(el.spouse).split('@')[0]}* ya está casado con otra persona.`);
      if (el.proposalTo === msg.sender && (el.proposalAt || 0) > Date.now() - 10 * 60 * 1000) {
        yo.spouse = target;
        el.spouse = msg.sender;
        el.proposalTo = null;
        yo.proposalTo = null;
        saveUsers();
        await sock.sendMessage(
          msg.chat,
          { text: `• :･ﾟ⊹˚• \`『 Boda 』\` •˚⊹:･ﾟ•\n\n✿ *@${msg.sender.split('@')[0]}* + *@${target.split('@')[0]}* ahora están casados.\n\n> *${global.botname2} • ${global.dev}*`, mentions: [msg.sender, target] },
          { quoted: { key: msg.key, message: {} } }
        );
        return;
      }
      yo.spouse = null;
      yo.proposalTo = target;
      yo.proposalAt = Date.now();
      saveUsers();
      await sock.sendMessage(
        msg.chat,
        { text: `✿ *@${msg.sender.split('@')[0]}* le propone matrimonio a *@${target.split('@')[0]}*.\n\n> ✐ Acepta con *.marry @${msg.sender.split('@')[0]}* (10 min)`, mentions: [msg.sender, target] },
        { quoted: { key: msg.key, message: {} } }
      );
    } catch (e) {
      console.error('[marry]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
