// .demote — quita admin. Solo admins.
import { baseJid, checkGroup, isAdminOf, pidOf, resolveTarget } from '../../lib/grupo.js';

export default {
  command: ['demote', 'degradar', 'quitaradmin'],
  category: 'grupo',
  desc: 'Quita admin a un miembro',
  uso: '<@mención | número | responder>',
  run: async ({ msg, sock, args }) => {
    try {
      const g = await checkGroup(sock, msg);
      if (!g) return;
      const target = resolveTarget(msg, args);
      if (!target) return msg.reply('❍ Responde al mensaje, menciona o escribe el número.');
      if (!isAdminOf(g.meta, target)) return msg.reply(`❍ @${baseJid(target)} ni siquiera es admin.`);
      await sock.groupParticipantsUpdate(msg.chat, [pidOf(g.meta, target)], 'demote');
      await new Promise((r) => setTimeout(r, 1500));
      const meta2 = await sock.groupMetadata(msg.chat).catch(() => null);
      if (meta2 && isAdminOf(meta2, target)) {
        return msg.reply(`❍ No se pudo quitar admin a @${baseJid(target)} (¿es el creador del grupo?).`);
      }
      await msg.reply(`✿ *Sin admin »* @${baseJid(target)}\n\n> ✐ Ya no es admin del grupo.\n\n> *${global.botname2} • ${global.dev}*`);
    } catch (e) {
      console.error('[demote]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
