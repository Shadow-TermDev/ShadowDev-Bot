// .del — borra el mensaje citado (o el comando). Solo admins.
// fromAgent: no responde (ni borra tu petición), retorna estructura y el agente narra.
import { checkGroup } from '../../lib/grupo.js';

export default {
  command: ['del', 'delete', 'borrar'],
  category: 'grupo',
  access: 'admin',
  desc: 'Borra el mensaje citado',
  run: async ({ msg, sock, fromAgent }) => {
    try {
      if (!fromAgent) {
        const g = await checkGroup(sock, msg);
        if (!g) return;
      }
      const q = msg.quotedKey;
      if (q) {
        await sock.sendMessage(msg.chat, { delete: { remoteJid: msg.chat, fromMe: false, id: q.id, participant: q.participant || msg.chat } });
        if (fromAgent) return { ok: true, code: 'deleted', data: {} };
        await sock.sendMessage(msg.chat, { delete: { remoteJid: msg.chat, fromMe: true, id: msg.key.id } }).catch(() => {});
        return;
      }
      if (fromAgent) return { ok: false, code: 'nothing', data: {} };
      await sock.sendMessage(msg.chat, { delete: { remoteJid: msg.chat, fromMe: true, id: msg.key.id } }).catch(() => {});
    } catch (e) {
      console.error('[del]', e?.message || e);
      if (fromAgent) return { ok: false, code: 'error', data: {}, detail: e?.message };
      await msg.reply(global.msgglobal);
    }
  }
};
