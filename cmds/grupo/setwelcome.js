// .setwelcome — mensaje de bienvenida (@user, @group). Solo admins.
import { checkGroup } from '../../lib/grupo.js';
import { setChat } from '../../lib/chats.js';

export default {
  command: ['setwelcome', 'setbienvenida'],
  category: 'grupo',
  desc: 'Define el mensaje de bienvenida',
  uso: '<texto con @user y @group>',
  run: async ({ msg, sock, args }) => {
    try {
      const g = await checkGroup(sock, msg);
      if (!g) return;
      const texto = args.join(' ').trim();
      if (!texto) return msg.reply('❍ Escribe el mensaje. Usa @user y @group.\n> ✦ Ej: *.setwelcome* Bienvenido @user a @group 🎉');
      setChat(msg.chat, 'welcomeMsg', texto.slice(0, 300));
      setChat(msg.chat, 'welcome', true);
      await msg.reply(`ᰔᩚ *Bienvenida guardada y activada ✅*\n\n> *${global.botname2} • ${global.dev}*`);
    } catch {
      await msg.reply(global.msgglobal);
    }
  }
};
