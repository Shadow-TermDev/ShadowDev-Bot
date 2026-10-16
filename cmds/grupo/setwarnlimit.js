// .setwarnlimit — límite de warns antes de expulsar. Solo admins.
import { checkGroup } from '../../lib/grupo.js';
import { setChat } from '../../lib/chats.js';

export default {
  command: ['setwarnlimit', 'setwarn'],
  category: 'grupo',
  access: 'admin',
  desc: 'Límite de advertencias',
  uso: '<número>',
  run: async ({ msg, sock, args }) => {
    try {
      const g = await checkGroup(sock, msg);
      if (!g) return;
      const n = Math.floor(Number(args[0]));
      if (!n || n < 1 || n > 10) return msg.reply('❍ Número del 1 al 10. Ej: *.setwarnlimit 3*');
      setChat(msg.chat, 'warnLimit', n);
      await msg.reply(`✿ *Límite »* ${n} advertencias.\n\n> *${global.botname2} • ${global.dev}*`);
    } catch {
      await msg.reply(global.msgglobal);
    }
  }
};
