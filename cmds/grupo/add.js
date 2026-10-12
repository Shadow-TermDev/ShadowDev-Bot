// .add — agrega números al grupo. Solo admins.
import { checkGroup } from '../../lib/grupo.js';

export default {
  command: ['add', 'agregar', 'invitar'],
  category: 'grupo',
  desc: 'Agrega miembros al grupo',
  uso: '<números con código país>',
  run: async ({ msg, sock, args }) => {
    try {
      const g = await checkGroup(sock, msg);
      if (!g) return;
      const nums = args.join(' ').split(/[\s,]+/).map((n) => n.replace(/\D/g, '')).filter((n) => n.length >= 10);
      if (!nums.length) return msg.reply('❍ Escribe números válidos. Ej: *.add* 51912345678');
      const res = await sock.groupParticipantsUpdate(msg.chat, nums.map((n) => n + '@s.whatsapp.net'), 'add');
      const ok = (res || []).filter((r) => String(r.status) === '200').length;
      await msg.reply(`• :･ﾟ⊹˚• \`『 Grupo 』\` •˚⊹:･ﾟ•\n\n✿ *Agregados »* ${ok}/${nums.length}\n\n> *${global.botname2} • ${global.dev}*
> ${global.link}`);
    } catch (e) {
      console.error('[add]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
