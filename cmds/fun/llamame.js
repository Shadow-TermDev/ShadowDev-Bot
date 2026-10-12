// .llamame — dile al bot cómo llamarte y te recordará.
import { setApodo } from '../../lib/users.js';

export default {
  command: ['llamame', 'soy', 'llamamiento'],
  category: 'fun',
  desc: 'Dile tu nombre al bot',
  uso: '<nombre>',
  run: async ({ msg, args }) => {
    try {
      const nombre = args.join(' ').trim();
      if (!nombre) return msg.reply('❍ Dime cómo te llamo. Ej: *.llamame* Erick');
      if (nombre.length > 30) return msg.reply('❍ Muy largo, máximo 30 letras.');
      setApodo(msg.sender, nombre);
      await msg.reply(`• :･ﾟ⊹˚• \`『 Nombre 』\` •˚⊹:･ﾟ•\n\nᰔᩚ *Listo »* desde ahora eres *${nombre}* ٩(˘◡˘)۶\n\n> *${global.botname2} • ${global.dev}*`);
    } catch {
      await msg.reply(global.msgglobal);
    }
  }
};
