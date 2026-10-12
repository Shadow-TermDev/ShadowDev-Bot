// .tagall — menciona a todos con un mensaje. Solo admins.
import { checkGroup } from '../../lib/grupo.js';

export default {
  command: ['tagall', 'todos', 'invocar'],
  category: 'grupo',
  desc: 'Menciona a todos los miembros',
  uso: '<mensaje>',
  run: async ({ msg, sock, args }) => {
    try {
      const g = await checkGroup(sock, msg);
      if (!g) return;
      const text = args.join(' ') || 'Llamado general';
      const mentions = g.meta.participants.map((p) => p.id).filter(Boolean);
      const lista = mentions.map((j) => `✿ @${j.split('@')[0]}`).join('\n');
      await sock.sendMessage(
        msg.chat,
        {
          text: `• :･ﾟ⊹˚• \`『 Llamado 』\` •˚⊹:･ﾟ•\n\n> ✐ ${text}\n\n${lista}\n\n> *${global.botname2} • ${global.dev}*
> ${global.link}`,
          mentions
        },
        { quoted: { key: msg.key, message: {} } }
      );
    } catch (e) {
      console.error('[tagall]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
