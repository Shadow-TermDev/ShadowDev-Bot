// .gacha on/off — apaga comandos gacha en el grupo. Solo admins.
import { checkGroup } from '../../lib/grupo.js';
import { setChat } from '../../lib/chats.js';

export default {
  command: ['gacha', 'gachas'],
  category: 'grupo',
  desc: 'Apaga o enciende el gacha',
  uso: '<on/off>',
  run: async ({ msg, sock, args }) => {
    try {
      const g = await checkGroup(sock, msg);
      if (!g) return;
      const v = (args[0] || '').toLowerCase();
      if (!['on', 'off'].includes(v)) return msg.reply('❍ Ej: *.gacha on* u *.gacha off*.');
      setChat(msg.chat, 'gachaOff', v === 'off');
      await msg.reply(`✿ *Gacha »* ${v === 'off' ? 'apagado' : 'activado'}.\n\n> *${global.botname2} • ${global.dev}*`);
    } catch {
      await msg.reply(global.msgglobal);
    }
  }
};
