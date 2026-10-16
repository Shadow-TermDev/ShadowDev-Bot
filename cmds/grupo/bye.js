// .bye on/off — despedida del grupo. Solo admins.
import { checkGroup } from '../../lib/grupo.js';
import { getChat, setChat } from '../../lib/chats.js';

export default {
  command: ['bye', 'despedida'],
  category: 'grupo',
  access: 'admin',
  desc: 'Activa o apaga la despedida',
  uso: '<on/off>',
  run: async ({ msg, sock, args }) => {
    try {
      const g = await checkGroup(sock, msg);
      if (!g) return;
      const v = (args[0] || '').toLowerCase();
      if (!['on', 'off', '1', '0'].includes(v)) return msg.reply('❍ Usa *.bye on* u *.bye off*.');
      const on = v === 'on' || v === '1';
      if (getChat(msg.chat).bye === (v === 'on' || v === '1')) return msg.reply('❍ La despedida ya está así.');
      setChat(msg.chat, 'bye', on);
      await msg.reply(`✿ *Despedida »* ${on ? 'activada' : 'apagada'}\n\n> *${global.botname2} • ${global.dev}*`);
    } catch {
      await msg.reply(global.msgglobal);
    }
  }
};
