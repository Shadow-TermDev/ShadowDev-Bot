// .register — ficha completa: nombre | edad | género | descripción.
// Reemplaza a .llamame/.olvidame.
import { getUser, saveUsers, setApodo } from '../../lib/users.js';

export default {
  command: ['register', 'registrar', 'registro'],
  category: 'fun',
  desc: 'Regístrate con tus datos',
  uso: '<nombre | edad | género | descripción>',
  run: async ({ msg, args }) => {
    try {
      const raw = args.join(' ');
      if (!raw.includes('|')) {
        return msg.reply('❍ Usa el formato:\n> ✐ *.register* TuNombre | 20 | Hombre/Mujer | tu descripción');
      }
      const [nombre = '', edad = '', genero = '', desc = ''] = raw.split('|').map((s) => s.trim());
      if (!nombre) return msg.reply('❍ Falta el nombre.');
      const u = getUser(msg.sender);
      setApodo(msg.sender, nombre); // valida nombres reservados (ShadowDev, etc.)
      if (edad && /^\d{1,3}$/.test(edad)) u.edad = edad;
      if (genero) u.genero = genero.slice(0, 15);
      if (desc) u.desc = desc.slice(0, 120);
      saveUsers();
      await msg.reply(
        `• :･ﾟ⊹˚• \`『 Registro 』\` •˚⊹:･ﾟ•\n\n` +
        `✿ *Nombre »* ${u.apodo}\n` +
        (u.edad ? `✿ *Edad »* ${u.edad}\n` : '') +
        (u.genero ? `✿ *Género »* ${u.genero}\n` : '') +
        (u.desc ? `✿ *Sobre ti »* ${u.desc}\n` : '') +
        `\n> ✐ Mira tu ficha con *.perfil*`
      );
    } catch (e) {
      console.error('[register]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
