// .delwarn — quita advertencias. Solo admins.
import { baseJid, checkGroup, resolveTarget } from '../../lib/grupo.js';
import { clearWarns } from '../../lib/chats.js';

export default {
  command: ['delwarn', 'quitarwarn', 'perdonar'],
  category: 'grupo',
  desc: 'Quita advertencias',
  run: async ({ msg, sock, args }) => {
    try {
      const g = await checkGroup(sock, msg);
      if (!g) return;
      const target = resolveTarget(msg, args);
      if (!target) return msg.reply('❍ Responde, menciona o escribe el número.');
      clearWarns(msg.chat, baseJid(target));
      await msg.reply(`✿ Advertencias de *@${baseJid(target)}* eliminadas.`);
    } catch {
      await msg.reply(global.msgglobal);
    }
  }
};
