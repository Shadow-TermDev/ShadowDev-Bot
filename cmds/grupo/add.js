// .add — agrega números al grupo. Solo admins.
import { checkGroup } from '../../lib/grupo.js';

export default {
  command: ['add', 'agregar', 'invitar'],
  category: 'grupo',
  access: 'admin',
  desc: 'Agrega miembros al grupo',
  uso: '<números con código país>',
  run: async ({ msg, sock, args }) => {
    try {
      const g = await checkGroup(sock, msg);
      if (!g) return;
      const nums = args.join(' ').split(/[\s,]+/).map((n) => n.replace(/\D/g, '')).filter((n) => n.length >= 10);
      if (!nums.length) return msg.reply('❍ Escribe números válidos. Ej: *.add* 51912345678');
      const res = await sock.groupParticipantsUpdate(msg.chat, nums.map((n) => n + '@s.whatsapp.net'), 'add').catch(async (e) => {
        // Sin permiso de agregar (privacidad): entregar invitación en su lugar
        const code = await sock.groupInviteCode(msg.chat).catch(() => null);
        if (code) {
          await msg.reply(`❍ No pude agregar directo (privacidad de WhatsApp).\n> ✐ Invita con este link:\nhttps://chat.whatsapp.com/${code}`);
          return null;
        }
        throw e;
      });
      if (!res) return;
      const ok = (res || []).filter((r) => String(r.status) === '200').length;
      await msg.reply(`• :･ﾟ⊹˚• \`『 Grupo 』\` •˚⊹:･ﾟ•\n\n✿ *Agregados »* ${ok}/${nums.length}\n\n> *${global.botname2} • ${global.dev}*`);
    } catch (e) {
      console.error('[add]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
