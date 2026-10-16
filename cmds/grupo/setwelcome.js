// .setwelcome — mensaje de bienvenida (@user, @group). Solo admins.
import { checkGroup } from '../../lib/grupo.js';
import { setChat } from '../../lib/chats.js';

export default {
  command: ['setwelcome', 'setbienvenida'],
  category: 'grupo',
  access: 'admin',
  desc: 'Define el mensaje de bienvenida',
  uso: '<texto con @user y @group>',
  run: async ({ msg, sock, args }) => {
    try {
      const g = await checkGroup(sock, msg);
      if (!g) return;
      const texto = args.join(' ').trim();
      if (!texto) return msg.reply('❍ Escribe el mensaje.\n> ✐ Variables: {user} {group} {desc} {members} {time} {link} {perfil} {prefix}\n> ✐ Ej: *.setwelcome* ❀ ¡Bienvenido a |{group}|! » {user}');
      setChat(msg.chat, 'welcomeMsg', texto.slice(0, 300));
      setChat(msg.chat, 'welcome', true);
      await msg.reply(`✿ *Bienvenida guardada y activada*\n\n> *${global.botname2} • ${global.dev}*`);
    } catch {
      await msg.reply(global.msgglobal);
    }
  }
};
