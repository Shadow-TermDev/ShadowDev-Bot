// .testwelcome — prueba bienvenida/despedida sin que entre/salga nadie. Solo admins.
import { checkGroup } from '../../lib/grupo.js';
import { getChat } from '../../lib/chats.js';

export default {
  command: ['testwelcome', 'testbye', 'probarbienvenida'],
  category: 'grupo',
  access: 'admin',
  desc: 'Prueba bienvenida/despedida',
  run: async ({ msg, sock, command }) => {
    try {
      const g = await checkGroup(sock, msg);
      if (!g) return;
      const cfg = getChat(msg.chat);
      const tag = '@' + String(msg.sender).split('@')[0];
      const bye = command.includes('bye');
      const on = bye ? cfg.bye : cfg.welcome;
      if (!on) return msg.reply(`❍ Está apagado. Actívalo con *.${bye ? 'bye' : 'welcome'} on*.`);
      const base = bye ? cfg.byeMsg : cfg.welcomeMsg;
      const t = (base || (bye ? 'Adiós @user' : 'Bienvenido @user')).replace(/@user/g, tag).replace(/@group/g, g.meta.subject || '');
      await sock.sendMessage(msg.chat, { text: `[prueba] ${t}`, mentions: [msg.sender] });
    } catch (e) {
      console.error('[testwelcome]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
