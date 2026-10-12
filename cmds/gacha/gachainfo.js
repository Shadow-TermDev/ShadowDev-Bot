// .gachainfo — tus estadísticas gacha.
import { displayName, getUser } from '../../lib/users.js';

export default {
  command: ['gachainfo', 'ginfo', 'infogacha'],
  category: 'gacha',
  desc: 'Ver tu info de gacha',
  run: async ({ msg }) => {
    try {
      const u = getUser(msg.sender);
      const chars = u.characters || [];
      const valor = chars.reduce((n, c) => n + (c.value || 0), 0);
      await msg.reply(
        `• :･ﾟ⊹˚• \`『 Mi Gacha 』\` •˚⊹:･ﾟ•\n\n` +
        `✿ *Usuario »* ${displayName(msg.sender, msg.pushName)}\n` +
        `✿ *Personajes »* ${chars.length}\n` +
        `✿ *Valor total »* ${valor.toLocaleString()} ${global.moneda}\n` +
        `✿ *Tiros »* ${u.rolls || 0}\n\n` +
        `> *${global.botname2} • ${global.dev}*`
      );
    } catch {
      await msg.reply(global.msgglobal);
    }
  }
};
