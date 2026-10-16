// .link — enlace de invitación del grupo. Solo admins.
import { checkGroup } from '../../lib/grupo.js';

export default {
  command: ['link', 'enlace', 'invite'],
  category: 'grupo',
  access: 'admin',
  desc: 'Muestra el enlace del grupo',
  run: async ({ msg, sock }) => {
    try {
      const g = await checkGroup(sock, msg);
      if (!g) return;
      const code = await sock.groupInviteCode(msg.chat);
      await msg.reply(`• :･ﾟ⊹˚• \`『 Enlace 』\` •˚⊹:･ﾟ•\n\n✿ *Grupo »* ${g.meta.subject || ''}\n✿ *Link »* https://chat.whatsapp.com/${code}\n\n> *${global.botname2} • ${global.dev}*`);
    } catch (e) {
      console.error('[link]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
