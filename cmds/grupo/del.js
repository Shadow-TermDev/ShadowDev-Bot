// .del — borra el mensaje citado (o el comando). Solo admins.
import { checkGroup } from '../../lib/grupo.js';

export default {
  command: ['del', 'delete', 'borrar'],
  category: 'grupo',
  desc: 'Borra el mensaje citado',
  run: async ({ msg, sock }) => {
    try {
      const g = await checkGroup(sock, msg);
      if (!g) return;
      const q = msg.quotedKey;
      if (q) {
        await sock.sendMessage(msg.chat, { delete: { remoteJid: msg.chat, fromMe: false, id: q.id, participant: q.participant || msg.chat } });
      }
      await sock.sendMessage(msg.chat, { delete: { remoteJid: msg.chat, fromMe: true, id: msg.key.id } }).catch(() => {});
    } catch {
      await msg.reply(global.msgglobal);
    }
  }
};
