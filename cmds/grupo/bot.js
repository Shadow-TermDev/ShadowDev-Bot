// .bot on/off — apaga o enciende el bot en el grupo. Solo admins.
import { checkGroup } from '../../lib/grupo.js';
import { getChat, setChat } from '../../lib/chats.js';

export default {
  command: ['bot', 'botcito'],
  category: 'grupo',
  access: 'admin',
  desc: 'Apaga o enciende el bot',
  uso: '<on/off>',
  run: async ({ msg, sock, args }) => {
    try {
      const g = await checkGroup(sock, msg);
      if (!g) return;
      const v = (args[0] || '').toLowerCase();
      if (!v) {
        const esta = getChat(msg.chat).botOff ? 'apagado' : 'encendido';
        return msg.reply(`✿ *Bot »* actualmente *${esta}*.\n> ✦ Usa *.bot on* u *.bot off*.`);
      }
      if (!['on', 'off'].includes(v)) return msg.reply('❍ Ej: *.bot on* u *.bot off*.');
      if (getChat(msg.chat).botOff === (v === 'off')) return msg.reply('❍ El bot ya está así.');
      setChat(msg.chat, 'botOff', v === 'off');
      await msg.reply(`✿ *Bot »* ${v === 'off' ? 'apagado. Me callo.' : 'activado de nuevo.'}\n\n> *${global.botname2} • ${global.dev}*`);
    } catch (e) {
      console.error('[bot]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
