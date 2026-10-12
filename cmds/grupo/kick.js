// .kick — expulsa (responder, mencionar o número). Solo admins.
import { baseJid, checkGroup, pidOf, resolveTarget } from '../../lib/grupo.js';

export default {
  command: ['kick', 'expulsar', 'echar'],
  category: 'grupo',
  desc: 'Expulsa un miembro del grupo',
  uso: '<@mención | número | responder>',
  run: async ({ msg, sock, args }) => {
    try {
      const g = await checkGroup(sock, msg);
      if (!g) return;
      const target = resolveTarget(msg, args);
      if (!target) return msg.reply('❍ Responde al mensaje, menciona o escribe el número. Ej: *.kick* @usuario');
      if (baseJid(target) === baseJid(g.bot)) return msg.reply('❍ No puedo expulsarme a mí mismo.');
      await sock.groupParticipantsUpdate(msg.chat, [pidOf(g.meta, target)], 'remove');
      await msg.reply(`ᰔᩚ *Expulsado »* @${baseJid(target)}\n\n> *${global.botname2} • ${global.dev}*`);
    } catch (e) {
      console.error('[kick]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
