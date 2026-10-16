// .add — agrega números al grupo. Solo admins.
// fromAgent: no responde, retorna { ok, code, data } y el agente narra
// (el agente ya validó grupo + admin + bot admin). En prefijo: plantilla.
// Si WhatsApp bloquea por privacidad, invita el link por privado a cada número.
import { checkGroup } from '../../lib/grupo.js';

export default {
  command: ['add', 'agregar', 'invitar'],
  category: 'grupo',
  access: 'admin',
  desc: 'Agrega miembros al grupo',
  uso: '<números con código país>',
  run: async ({ msg, sock, args, fromAgent }) => {
    try {
      if (!fromAgent) {
        const g = await checkGroup(sock, msg);
        if (!g) return;
      }
      const nums = args.join(' ').split(/[\s,]+/).map((n) => n.replace(/\D/g, '')).filter((n) => n.length >= 10);
      if (!nums.length) {
        if (fromAgent) return { ok: false, code: 'need_numbers', data: {} };
        return msg.reply('❍ Escribe números válidos. Ej: *.add* 51912345678');
      }
      const res = await sock.groupParticipantsUpdate(msg.chat, nums.map((n) => n + '@s.whatsapp.net'), 'add').catch(() => null);
      const estados = nums.map((n, i) => ({ n, status: String(res?.[i]?.status || 0) }));
      const failed = estados.filter((e) => e.status !== '200').map((e) => e.n);
      const added = nums.length - failed.length;

      let link = null;
      let dm = 0;
      if (failed.length) {
        try {
          const code = await sock.groupInviteCode(msg.chat);
          if (code) link = 'https://chat.whatsapp.com/' + code;
        } catch {}
        if (link) {
          const meta = await sock.groupMetadata(msg.chat).catch(() => null);
          const nombre = meta?.subject || 'el grupo';
          for (const n of failed) {
            try {
              await sock.sendMessage(n + '@s.whatsapp.net', { text: `✿ Te invitaron al grupo *${nombre}*:\n${link}` });
              dm++;
            } catch {}
          }
        }
      }

      if (fromAgent) {
        const code = added === nums.length ? 'added' : added > 0 ? 'partial' : 'privacy';
        const uno = nums.length === 1 ? nums[0] : null;
        return { ok: added > 0, code, data: { added, total: nums.length, failed, link, dm, num: uno, mention: uno ? uno + '@s.whatsapp.net' : null } };
      }

      if (!failed.length) {
        await msg.reply(`• :･ﾟ⊹˚• \`『 Grupo 』\` •˚⊹:･ﾟ•\n\n✿ *Agregados »* ${added}/${nums.length}\n\n> *${global.botname2} • ${global.dev}*`);
      } else if (added > 0) {
        await msg.reply(`✿ *Agregados »* ${added}/${nums.length}\n> ✐ Directo no pude con: ${failed.join(', ')} (privacidad).${dm ? ' Les mandé la invitación por privado.' : ''}${link ? `\n${link}` : ''}`);
      } else {
        await msg.reply(`❍ No pude agregarlos directo (privacidad de WhatsApp).${dm ? ' Les mandé la invitación por privado.' : ''}${link ? `\n> ✐ Invítalos con este link:\n${link}` : ''}`);
      }
    } catch (e) {
      console.error('[add]', e?.message || e);
      if (fromAgent) return { ok: false, code: 'error', data: {}, detail: e?.message };
      await msg.reply(global.msgglobal);
    }
  }
};
