// .kick — expulsa (responder, mencionar o número). Solo admins.
// fromAgent: no responde, retorna { ok, code, data } y el agente narra.
import { baseJid, checkGroup, esBot, findParticipant, objetivoHumano, pidOf } from '../../lib/grupo.js';

export default {
  command: ['kick', 'expulsar', 'echar'],
  category: 'grupo',
  access: 'admin',
  desc: 'Expulsa un miembro del grupo',
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
        if (fromAgent) return { ok: false, code: 'kick_self', data: { mention: target, num: baseJid(target) } };
        return msg.reply('❍ Conmigo no, que me quedo sin grupo.');
      }
      if (!target) {
        if (fromAgent) return { ok: false, code: 'need_target', data: {} };
        return msg.reply('❍ Responde al mensaje, menciona o escribe el número. Ej: *.kick* @usuario');
      }
      await sock.groupParticipantsUpdate(msg.chat, [pidOf(meta, target)], 'remove');
      await new Promise((r) => setTimeout(r, 1500));
      const meta2 = await sock.groupMetadata(msg.chat).catch(() => null);
      const sigue = meta2 && findParticipant(meta2, target);
      if (fromAgent) {
        return sigue
          ? { ok: false, code: 'kick_failed', data: { mention: target, num: baseJid(target) } }
          : { ok: true, code: 'kicked', data: { mention: target, num: baseJid(target) } };
      }
      if (sigue) return msg.reply(`❍ No se pudo expulsar a @${baseJid(target)} (¿es admin o el creador?).`);
      await msg.reply(`✿ *Expulsado »* @${baseJid(target)}\n\n> *${global.botname2} • ${global.dev}*`);
    } catch (e) {
      console.error('[kick]', e?.message || e);
      if (fromAgent) return { ok: false, code: 'error', data: {}, detail: e?.message };
      await msg.reply(global.msgglobal);
    }
  }
};
