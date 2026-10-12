// .divorce — fin del matrimonio.
import { getUser, saveUsers } from '../../lib/users.js';

export default {
  command: ['divorce', 'divorcio'],
  category: 'fun',
  desc: 'Divórciate',
  run: async ({ msg }) => {
    try {
      const yo = getUser(msg.sender);
      if (!yo.spouse) return msg.reply('❍ Ni siquiera estás casado.');
      const ex = yo.spouse;
      yo.spouse = null;
      const otro = getUser(ex);
      if (otro.spouse === msg.sender) otro.spouse = null;
      saveUsers();
      await msg.reply(`✿ Divorcio firmado con *@${String(ex).split('@')[0]}*.\n\n> *${global.botname2} • ${global.dev}*`);
    } catch {
      await msg.reply(global.msgglobal);
    }
  }
};
