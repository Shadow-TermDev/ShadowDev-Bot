// .antilink on/off — borra links de WhatsApp y al 3er aviso expulsa. Solo admins.
import { checkGroup } from '../../lib/grupo.js';
import { setChat } from '../../lib/chats.js';

export default {
  command: ['antilink', 'antienlace'],
  category: 'grupo',
  desc: 'Activa o apaga el anti-links',
  uso: '<on/off>',
  run: async ({ msg, sock, args }) => {
    try {
      const g = await checkGroup(sock, msg);
      if (!g) return;
      const v = (args[0] || '').toLowerCase();
      if (!['on', 'off', '1', '0'].includes(v)) return msg.reply('❍ Usa *.antilink on* u *.antilink off*.');
      const on = v === 'on' || v === '1';
      setChat(msg.chat, 'antilink', on);
      await msg.reply(`✿ *Anti-link »* ${on ? 'activado (al 3er aviso expulsa)' : 'apagado'}\n\n> *${global.botname2} • ${global.dev}*
> ${global.link}`);
    } catch {
      await msg.reply(global.msgglobal);
    }
  }
};
