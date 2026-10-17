// .charinfo — ficha de un personaje (con foto y dueño).
import { getBuffer } from '../../lib/serialize.js';
import { displayName } from '../../lib/users.js';
import { duenoDe, imagenDe, personajes, buscarPersonaje } from '../../lib/gacha.js';

export default {
  command: ['charinfo', 'personaje', 'char'],
  category: 'gacha',
  desc: 'Ficha de un personaje',
  uso: '<nombre>',
  run: async ({ msg, sock, args }) => {
    try {
      const q = args.join(' ').toLowerCase();
      if (!q) return msg.reply('❍ Escribe el nombre. Ej: *.charinfo* Asuna');
      const idx = buscarPersonaje(personajes(), q);
      if (idx < 0) return msg.reply('❍ Ese personaje no existe en el catálogo.');
      const p = personajes()[idx];
      const dueno = duenoDe(p.name);
      const texto =
        `• :･ﾟ⊹˚• \`『 ${p.name} 』\` •˚⊹:･ﾟ•\n\n` +
        `✿ *Género »* ${p.gender || '?'}\n` +
        `✿ *Valor »* ${(p.value || 0).toLocaleString()} ${global.moneda}\n` +
        `✿ *Estado »* ${dueno ? `de ${dueno.nombre}` : 'Libre'}\n` +
        `✿ *Fuente »* ${p.source || '?'}\n\n` +
        `> *${global.botname2} • ${global.dev}*`;
      try {
        const img = await imagenDe(p.keyword);
        if (!img) throw new Error('sin imagen');
        const buf = await getBuffer(img);
        await sock.sendMessage(msg.chat, { image: buf, caption: texto }, { quoted: { key: msg.key, message: {} } });
      } catch {
        await sock.sendMessage(msg.chat, { text: texto }, { quoted: { key: msg.key, message: {} } });
      }
    } catch (e) {
      console.error('[charinfo]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
