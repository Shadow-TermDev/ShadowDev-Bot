// .register — ficha completa: nombre | edad | género | descripción.
// Reemplaza a .llamame/.olvidame.
import { getUser, saveUsers } from '../../lib/users.js';

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
      u.apodo = nombre.slice(0, 30);
      if (edad) u.edad = edad.slice(0, 5);
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
    } catch {
      await msg.reply(global.msgglobal);
    }
  }
};
