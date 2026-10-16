// .link — enlace de invitación del grupo. Solo admins.
// fromAgent: manda la tarjeta con el link EXACTO (la IA no debe recrear URLs)
// y retorna el código para que el agente sume su línea de personalidad.
import { checkGroup } from '../../lib/grupo.js';

export default {
  command: ['link', 'enlace', 'invite'],
  category: 'grupo',
  access: 'admin',
  desc: 'Muestra el enlace del grupo',
  run: async ({ msg, sock, fromAgent }) => {
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
      const code = await sock.groupInviteCode(msg.chat);
      await msg.reply(`• :･ﾟ⊹˚• \`『 Enlace 』\` •˚⊹:･ﾟ•\n\n✿ *Grupo »* ${meta.subject || ''}\n✿ *Link »* https://chat.whatsapp.com/${code}\n\n> *${global.botname2} • ${global.dev}*`);
      if (fromAgent) return { ok: true, code: 'link', data: { grupo: meta.subject || '', link: `https://chat.whatsapp.com/${code}` } };
    } catch (e) {
      console.error('[link]', e?.message || e);
      if (fromAgent) return { ok: false, code: 'error', data: {}, detail: e?.message };
      await msg.reply(global.msgglobal);
    }
  }
};
