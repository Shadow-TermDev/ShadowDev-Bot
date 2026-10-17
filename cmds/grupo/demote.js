// .demote — quita admin. Solo admins.
// fromAgent: no responde, retorna { ok, code, data } y el agente narra.
import { baseJid, checkGroup, esBot, isAdminOf, objetivoHumano, pidOf } from '../../lib/grupo.js';

export default {
  command: ['demote', 'degradar', 'quitaradmin'],
  category: 'grupo',
  access: 'admin',
  desc: 'Quita admin a un miembro',
  uso: '<@mención | número | responder>',
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
      const target = objetivoHumano(sock, msg, args);
      if (target && esBot(sock, target)) {
        if (fromAgent) return { ok: false, code: 'self_target', data: { mention: target, num: baseJid(target) } };
        return msg.reply('❍ Conmigo no. Pide lo mismo para otro miembro.');
      }
      if (!target) {
        if (fromAgent) return { ok: false, code: 'need_target', data: {} };
        return msg.reply('❍ Responde al mensaje, menciona o escribe el número.');
      }
      if (!isAdminOf(meta, target)) {
        if (fromAgent) return { ok: false, code: 'not_admin', data: { mention: target, num: baseJid(target) } };
        return msg.reply(`❍ @${baseJid(target)} ni siquiera es admin.`);
      }
      await sock.groupParticipantsUpdate(msg.chat, [pidOf(meta, target)], 'demote');
      await new Promise((r) => setTimeout(r, 1500));
      const meta2 = await sock.groupMetadata(msg.chat).catch(() => null);
      const sigue = meta2 && isAdminOf(meta2, target);
      if (fromAgent) {
        return sigue
          ? { ok: false, code: 'demote_failed', data: { mention: target, num: baseJid(target) } }
          : { ok: true, code: 'demoted', data: { mention: target, num: baseJid(target) } };
      }
      if (sigue) return msg.reply(`❍ No se pudo quitar admin a @${baseJid(target)} (¿es el creador del grupo?).`);
      await msg.reply(`✿ *Sin admin »* @${baseJid(target)}\n\n> ✐ Ya no es admin del grupo.\n\n> *${global.botname2} • ${global.dev}*`);
    } catch (e) {
      console.error('[demote]', e?.message || e);
      if (fromAgent) return { ok: false, code: 'error', data: {}, detail: e?.message };
      await msg.reply(global.msgglobal);
    }
  }
};
