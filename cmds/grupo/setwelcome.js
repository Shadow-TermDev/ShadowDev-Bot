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
      if (!texto) return msg.reply('❍ Escribe el mensaje. Variables: {user} {group} {desc} {members} {time} {prefix}\n> ✐ Ej: *.setwelcome* ❀ ¡Bienvenido a |{group}|!\n\t» {user}\n\n> ✐ Puedes usar *{prefix}menu* para ver la lista de comandos.\n> 🜸 {link}');
      setChat(msg.chat, 'welcomeMsg', texto.slice(0, 300));
      setChat(msg.chat, 'welcome', true);
      await msg.reply(`✿ *Bienvenida guardada y activada ✅*\n\n> *${global.botname2} • ${global.dev}*`);
    } catch {
      await msg.reply(global.msgglobal);
    }
  }
};
