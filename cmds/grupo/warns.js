// .warns — ver advertencias. Solo admins.
import { baseJid, checkGroup, resolveTarget } from '../../lib/grupo.js';
import { getChat } from '../../lib/chats.js';

export default {
  command: ['warns', 'avisos', 'advertencias'],
  category: 'grupo',
  access: 'admin',
  desc: 'Ver advertencias de alguien',
  run: async ({ msg, sock, args }) => {
    try {
      const g = await checkGroup(sock, msg);
      if (!g) return;
      const target = resolveTarget(msg, args) || msg.sender;
      const n = getChat(msg.chat).warns[baseJid(target)] || 0;
      await msg.reply(`✿ *@${baseJid(target)}* tiene *${n}* advertencias.`);
    } catch {
      await msg.reply(global.msgglobal);
    }
  }
};
