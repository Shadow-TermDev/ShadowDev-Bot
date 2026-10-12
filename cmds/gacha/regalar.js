// .regalar — transfiere un personaje a otro usuario.
import { displayName, getUser, saveUsers } from '../../lib/users.js';

export default {
  command: ['regalar', 'dar', 'transferir'],
  category: 'gacha',
  desc: 'Regala un personaje',
  uso: '<@usuario> <nombre>',
  run: async ({ msg, args }) => {
    try {
      const target = (msg.mentionedJid || [])[0] || null;
      if (!target) return msg.reply('❍ Menciona a quién. Ej: *.regalar* @amigo Asuna');
      const nombre = args.filter((a) => !a.startsWith('@')).join(' ');
      if (!nombre) return msg.reply('❍ Escribe el nombre del personaje.');
      const yo = getUser(msg.sender);
      const idx = (yo.characters || []).findIndex((c) => c.name.toLowerCase().includes(nombre.toLowerCase()));
      if (idx < 0) return msg.reply('❍ No tienes ese personaje. Mira tu *.inv*.');
      const [pers] = yo.characters.splice(idx, 1);
      const otro = getUser(target);
      if (!otro.characters.some((c) => c.name === pers.name)) otro.characters.push(pers);
      saveUsers();
      await msg.reply(
        `• :･ﾟ⊹˚• \`『 Regalo 』\` •˚⊹:･ﾟ•\n\n✿ *${pers.name}* pasó de *${displayName(msg.sender, msg.pushName)}* a *@${target.split('@')[0]}*\n\n> *${global.botname2} • ${global.dev}*`
      );
    } catch (e) {
      console.error('[regalar]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
