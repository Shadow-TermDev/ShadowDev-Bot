// .onlyadmin on/off — solo admins usan comandos. Solo admins.
import { checkGroup } from '../../lib/grupo.js';
import { getChat, setChat } from '../../lib/chats.js';

export default {
  command: ['onlyadmin', 'soloadmins'],
  category: 'grupo',
  access: 'admin',
  desc: 'Solo admins usan comandos',
  uso: '<on/off>',
  run: async ({ msg, sock, args }) => {
    try {
      const g = await checkGroup(sock, msg);
      if (!g) return;
      const v = (args[0] || '').toLowerCase();
      if (!['on', 'off'].includes(v)) return msg.reply('❍ Ej: *.onlyadmin on* u *.onlyadmin off*.');
      if (getChat(msg.chat).onlyAdmin === (v === 'on')) return msg.reply('❍ El onlyadmin ya está así.');
      setChat(msg.chat, 'onlyAdmin', v === 'on');
      await msg.reply(`✿ *OnlyAdmin »* ${v === 'off' ? 'apagado' : 'activado'}.\n\n> *${global.botname2} • ${global.dev}*`);
    } catch (e) {
      console.error('[onlyadmin]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
