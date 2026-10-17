// .getpic — foto de perfil de alguien.
import { displayName } from '../../lib/users.js';

export default {
  command: ['getpic', 'pfp', 'foto'],
  category: 'utils',
  desc: 'Ver foto de perfil',
  uso: '<@mención>',
  run: async ({ msg, sock }) => {
    try {
      const target = (msg.mentionedJid || [])[0] || msg.quotedSender || msg.sender;
      try {
        const url = await sock.profilePictureUrl(target, 'image');
        await sock.sendMessage(
          msg.chat,
          { image: { url }, caption: `✿ *Foto »* ${displayName(target, null)}\n\n> *${global.botname2} • ${global.dev}*` },
          { quoted: { key: msg.key, message: {} } }
        );
      } catch {
        await msg.reply('❍ Sin foto de perfil.');
      }
    } catch (e) {
      console.error('[getpic]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
