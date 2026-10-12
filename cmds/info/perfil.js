// .perfil — lo que el bot sabe de ti.
import { displayName, getUser } from '../../lib/users.js';
import { phoneOf } from '../../lib/grupo.js';

export default {
  command: ['perfil', 'yo', 'mipc'],
  category: 'info',
  desc: 'Muestra tu perfil guardado',
  run: async ({ msg, sock }) => {
    try {
      const u = getUser(msg.sender);
      let numero = String(msg.sender).split('@')[0];
      if (msg.isGroup) {
        try {
          const meta = await sock.groupMetadata(msg.chat);
          numero = phoneOf(meta, msg.sender);
        } catch {}
      }
      const desde = new Date(u.firstSeen || Date.now()).toLocaleDateString('es-PE', { timeZone: 'America/Lima' });
      await msg.reply(
        `• :･ﾟ⊹˚• \`『 Perfil 』\` •˚⊹:･ﾟ•\n\n` +
        `ᰔᩚ *Nombre »* ${displayName(msg.sender, msg.pushName)}${u.apodo ? ` (@${msg.pushName || '?'})` : ''}\n` +
        `ᰔᩚ *Número »* +${numero}\n` +
        `ᰔᩚ *Mensajes »* ${u.msgs || 0}\n` +
        `ᰔᩚ *Aquí desde »* ${desde}\n\n` +
        `> ✦ Cambia tu nombre con *.llamame*\n\n> *${global.botname2} • ${global.dev}*`
      );
    } catch {
      await msg.reply(global.msgglobal);
    }
  }
};
