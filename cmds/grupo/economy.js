// .economy on/off — apaga comandos de economía en el grupo. Solo admins.
import { checkGroup } from '../../lib/grupo.js';
import { setChat } from '../../lib/chats.js';

export default {
  command: ['economy', 'economia'],
  category: 'grupo',
  desc: 'Apaga o enciende la economía',
  uso: '<on/off>',
  run: async ({ msg, sock, args }) => {
    try {
      const g = await checkGroup(sock, msg);
      if (!g) return;
      const v = (args[0] || '').toLowerCase();
      if (!['on', 'off'].includes(v)) return msg.reply('❍ Ej: *.economy on* u *.economy off*.');
      setChat(msg.chat, 'economyOff', v === 'off');
      await msg.reply(`✿ *Economía »* ${v === 'off' ? 'apagada' : 'activada'}.\n\n> *${global.botname2} • ${global.dev}*`);
    } catch {
      await msg.reply(global.msgglobal);
    }
  }
};
