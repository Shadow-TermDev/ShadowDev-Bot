// .welcome on/off — bienvenida del grupo. Solo admins.
import { checkGroup } from '../../lib/grupo.js';
import { setChat } from '../../lib/chats.js';

export default {
  command: ['welcome', 'bienvenida'],
  category: 'grupo',
  desc: 'Activa o apaga la bienvenida',
  uso: '<on/off>',
  run: async ({ msg, sock, args }) => {
    try {
      const g = await checkGroup(sock, msg);
      if (!g) return;
      const v = (args[0] || '').toLowerCase();
      if (!['on', 'off', '1', '0'].includes(v)) return msg.reply('❍ Usa *.welcome on* u *.welcome off*.');
      const on = v === 'on' || v === '1';
      setChat(msg.chat, 'welcome', on);
      await msg.reply(`✿ *Bienvenida »* ${on ? 'activada' : 'apagada'}\n\n> *${global.botname2} • ${global.dev}*`);
    } catch {
      await msg.reply(global.msgglobal);
    }
  }
};
