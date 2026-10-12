// .warn — advierte (al límite expulsa). Solo admins.
import { baseJid, checkGroup, pidOf, resolveTarget } from '../../lib/grupo.js';
import { addWarn, clearWarns, getChat } from '../../lib/chats.js';

export default {
  command: ['warn', 'advertir', 'aviso'],
  category: 'grupo',
  desc: 'Advierte a un miembro',
  uso: '<@mención> <razón>',
  run: async ({ msg, sock, args }) => {
    try {
      const g = await checkGroup(sock, msg);
      if (!g) return;
      const target = resolveTarget(msg, args);
      if (!target) return msg.reply('❍ Responde, menciona o escribe el número.');
      const razon = args.filter((a) => !a.startsWith('@')).join(' ') || 'sin razón';
      const clave = baseJid(target);
      const n = addWarn(msg.chat, clave);
      const limite = getChat(msg.chat).warnLimit || 3;
      if (n >= limite) {
        clearWarns(msg.chat, clave);
        await sock.groupParticipantsUpdate(msg.chat, [pidOf(g.meta, target)], 'remove').catch(() => {});
        await sock.sendMessage(msg.chat, { text: `✿ *@${baseJid(target)}* expulsado (warns ${n}/${limite}: ${razon}).`, mentions: [target] });
      } else {
        await sock.sendMessage(msg.chat, { text: `❍ Advertencia ${n}/${limite} a *@${baseJid(target)}*: ${razon}.`, mentions: [target] });
      }
    } catch {
      await msg.reply(global.msgglobal);
    }
  }
};
