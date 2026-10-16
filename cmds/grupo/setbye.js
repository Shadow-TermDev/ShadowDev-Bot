// .setbye — mensaje de despedida (@user, @group). Solo admins.
import { checkGroup } from '../../lib/grupo.js';
import { setChat } from '../../lib/chats.js';

export default {
  command: ['setbye', 'setdespedida'],
  category: 'grupo',
  access: 'admin',
  desc: 'Define el mensaje de despedida',
  uso: '<texto con @user y @group>',
  run: async ({ msg, sock, args }) => {
    try {
      const g = await checkGroup(sock, msg);
      if (!g) return;
      const texto = args.join(' ').trim();
      if (!texto) return msg.reply('❍ Escribe el mensaje.\n> ✐ Variables: {user} {group} {desc} {members} {time} {link} {perfil} {prefix}');
      setChat(msg.chat, 'byeMsg', texto.slice(0, 300));
      setChat(msg.chat, 'bye', true);
      await msg.reply(`✿ *Despedida guardada y activada*\n\n> *${global.botname2} • ${global.dev}*`);
    } catch {
      await msg.reply(global.msgglobal);
    }
  }
};
