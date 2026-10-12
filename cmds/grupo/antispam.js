// .antispam on/off — borra flood (+6 msgs en 8s). Solo admins.
import { checkGroup } from '../../lib/grupo.js';
import { setChat } from '../../lib/chats.js';

export default {
  command: ['antispam', 'antiflood'],
  category: 'grupo',
  desc: 'Activa o apaga el anti-spam',
  uso: '<on/off>',
  run: async ({ msg, sock, args }) => {
    try {
      const g = await checkGroup(sock, msg);
      if (!g) return;
      const v = (args[0] || '').toLowerCase();
      if (!['on', 'off', '1', '0'].includes(v)) return msg.reply('❍ Usa *.antispam on* u *.antispam off*.');
      const on = v === 'on' || v === '1';
      setChat(msg.chat, 'antispam', on);
      await msg.reply(`✿ *Anti-spam »* ${on ? 'activado' : 'apagado'}\n\n> *${global.botname2} • ${global.dev}*`);
    } catch {
      await msg.reply(global.msgglobal);
    }
  }
};
