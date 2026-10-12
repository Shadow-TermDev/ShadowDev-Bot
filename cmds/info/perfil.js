// .perfil — lo que el bot sabe de ti.
import { displayName, getUser } from '../../lib/users.js';
import { realPhone } from '../../lib/grupo.js';

export default {
  command: ['perfil', 'yo', 'mipc'],
  category: 'info',
  desc: 'Muestra tu perfil guardado',
  run: async ({ msg, sock }) => {
    try {
      const u = getUser(msg.sender);
      const numero = await realPhone(sock, msg.chat, msg.sender);
      const nombre = displayName(msg.sender, msg.pushName);
      const extra = msg.pushName && msg.pushName.toLowerCase() !== String(nombre).toLowerCase() ? ` (@${msg.pushName})` : '';
      const desde = new Date(u.firstSeen || Date.now()).toLocaleDateString('es-PE', { timeZone: 'America/Lima' });
      await msg.reply(
        `• :･ﾟ⊹˚• \`『 Perfil 』\` •˚⊹:･ﾟ•\n\n` +
        `ᰔᩚ *Nombre »* ${nombre}${extra}\n` +
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
