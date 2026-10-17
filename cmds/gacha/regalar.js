// .regalar — transfiere un personaje a otro usuario.
import { displayName, getUser, saveUsers } from '../../lib/users.js';
import { buscarPersonaje } from '../../lib/gacha.js';
import { esBot } from '../../lib/grupo.js';

export default {
  command: ['regalar', 'transferir'],
  category: 'gacha',
  desc: 'Regala un personaje',
  uso: '<@usuario> <nombre>',
  run: async ({ msg, sock, args }) => {
    try {
      const target = (msg.mentionedJid || [])[0] || null;
      if (!target) return msg.reply('❍ Menciona a quién. Ej: *.regalar* @amigo Asuna');
      if (target === msg.sender) return msg.reply('❍ No puedes regalarte algo a ti mismo.');
      if (esBot(sock, target)) return msg.reply('❍ No puedes darle cosas al bot.');
      const nombre = args.filter((a) => !a.startsWith('@')).join(' ');
      if (!nombre) return msg.reply('❍ Escribe el nombre del personaje.');
      const yo = getUser(msg.sender);
      const idx = buscarPersonaje(yo.characters, nombre);
      if (idx < 0) return msg.reply('❍ No tienes ese personaje. Mira tu *.inv*.');
      const pers = yo.characters[idx];
      const otro = getUser(target);
      if ((otro.characters || []).some((c) => c.name === pers.name)) {
        return msg.reply(`❍ *@${String(target).split('@')[0]}* ya tiene *${pers.name}*.`, { mentions: [target] });
      }
      yo.characters.splice(idx, 1);
      otro.characters.push(pers);
      saveUsers();
      await msg.reply(
        `• :･ﾟ⊹˚• \`『 Regalo 』\` •˚⊹:･ﾟ•\n\n✿ *${pers.name}* pasó de *${displayName(msg.sender, msg.pushName)}* a *@${String(target).split('@')[0]}*\n\n> *${global.botname2} • ${global.dev}*`,
        { mentions: [target] }
      );
    } catch (e) {
      console.error('[regalar]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
