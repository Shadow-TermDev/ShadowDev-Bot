// .perfil — ficha con foto de perfil.
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
      const texto =
        `• :･ﾟ⊹˚• \`『 Perfil 』\` •˚⊹:･ﾟ•\n\n` +
        `ᰔᩚ *Nombre »* ${nombre}${extra}\n` +
        (u.edad ? `ᰔᩚ *Edad »* ${u.edad}\n` : '') +
        (u.genero ? `ᰔᩚ *Género »* ${u.genero}\n` : '') +
        (u.desc ? `ᰔᩚ *Sobre ti »* ${u.desc}\n` : '') +
        `ᰔᩚ *Número »* +${numero}\n` +
        `ᰔᩚ *Mensajes »* ${u.msgs || 0}\n` +
        `ᰔᩚ *Monedas »* ${(u.coins || 0).toLocaleString()} 🪙\n` +
        `ᰔᩚ *Aquí desde »* ${desde}\n\n` +
        `> ✦ Regístrate con *.register*\n\n> *${global.botname2} • ${global.dev}*`;
      try {
        const pic = await sock.profilePictureUrl(msg.sender, 'image');
        await sock.sendMessage(msg.chat, { image: { url: pic }, caption: texto }, { quoted: { key: msg.key, message: {} } });
      } catch {
        await msg.reply(texto);
      }
    } catch {
      await msg.reply(global.msgglobal);
    }
  }
};
