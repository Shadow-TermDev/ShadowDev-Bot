// .promote / .demote — da o quita admin. Solo admins.
import { baseJid, checkGroup, pidOf, resolveTarget } from '../../lib/grupo.js';

export default {
  command: ['promote', 'promover', 'daradmin'],
  category: 'grupo',
  desc: 'Da admin a un miembro',
  uso: '<@mención | número | responder>',
  run: async ({ msg, sock, args }) => {
    try {
      const g = await checkGroup(sock, msg);
      if (!g) return;
      const target = resolveTarget(msg, args);
      if (!target) return msg.reply('❍ Responde al mensaje, menciona o escribe el número.');
      await sock.groupParticipantsUpdate(msg.chat, [pidOf(g.meta, target)], 'promote');
      await msg.reply(`ᰔᩚ *Admin »* @${baseJid(target)}\n\n> *${global.botname2} • ${global.dev}*`);
    } catch (e) {
      console.error('[promote]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
