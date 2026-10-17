// .warn — advierte (al límite expulsa). Solo admins.
// fromAgent: no responde, retorna { ok, code, data } y el agente narra.
import { baseJid, checkGroup, pidOf, resolveTarget } from '../../lib/grupo.js';
import { addWarn, clearWarns, getChat } from '../../lib/chats.js';

export default {
  command: ['warn', 'advertir', 'aviso'],
  category: 'grupo',
  access: 'admin',
  desc: 'Advierte a un miembro',
  uso: '<@mención> <razón>',
  run: async ({ msg, sock, args, fromAgent }) => {
    try {
      let meta = null;
      if (fromAgent) {
        meta = await sock.groupMetadata(msg.chat).catch(() => null);
        if (!meta) return { ok: false, code: 'error', data: {}, detail: 'sin metadata' };
      } else {
        const g = await checkGroup(sock, msg);
        if (!g) return;
        meta = g.meta;
      }
      const target = resolveTarget(msg, args);
      if (!target) {
        if (fromAgent) return { ok: false, code: 'need_target', data: {} };
        return msg.reply('❍ Responde, menciona o escribe el número.');
      }
      const razon = args.filter((a) => !a.startsWith('@')).join(' ') || 'sin razón';
      const clave = baseJid(target);
      const n = addWarn(msg.chat, clave);
      const limite = getChat(msg.chat).warnLimit || 3;
      const datos = { mention: target, num: clave, n, limite, razon };
      if (n >= limite) {
        // Expulsar PRIMERO y limpiar solo si salió bien: si el kick falla
        // (admin/creador/privacidad) el usuario no queda impune con 0 warns.
        const ok = await sock
          .groupParticipantsUpdate(msg.chat, [pidOf(meta, target)], 'remove')
          .then(() => true)
          .catch(() => false);
        if (ok) clearWarns(msg.chat, clave);
        if (fromAgent) {
          return ok
            ? { ok: true, code: 'warned_out', data: datos }
            : { ok: false, code: 'kick_failed', data: { mention: target, num: clave } };
        }
        if (!ok) return msg.reply(`❍ No pude expulsar a *@${clave}* (¿es admin o creador?). Warns ${n}/${limite}.`, { mentions: [target] });
        await sock.sendMessage(msg.chat, { text: `✿ *@${clave}* expulsado (warns ${n}/${limite}: ${razon}).`, mentions: [target] });
      } else {
        if (fromAgent) return { ok: true, code: 'warned', data: datos };
        await sock.sendMessage(msg.chat, { text: `❍ Advertencia ${n}/${limite} a *@${clave}*: ${razon}.`, mentions: [target] });
      }
    } catch (e) {
      console.error('[warn]', e?.message || e);
      if (fromAgent) return { ok: false, code: 'error', data: {}, detail: e?.message };
      await msg.reply(global.msgglobal);
    }
  }
};
