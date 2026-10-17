// .vender — vende un personaje por su valor.
import { getUser, saveUsers } from '../../lib/users.js';
import { buscarPersonaje } from '../../lib/gacha.js';

export default {
  command: ['vender', 'sell'],
  category: 'gacha',
  desc: 'Vende un personaje por su valor',
  uso: '<nombre>',
  run: async ({ msg, args }) => {
    try {
      const q = args.join(' ').toLowerCase();
      if (!q) return msg.reply('❍ Escribe el nombre. Mira tu *.inv*.');
      const u = getUser(msg.sender);
      const idx = buscarPersonaje(u.characters, q);
      if (idx < 0) return msg.reply('❍ No tienes ese personaje.');
      const [p] = u.characters.splice(idx, 1);
      u.coins = (u.coins || 0) + (p.value || 0);
      saveUsers();
      await msg.reply(`• :･ﾟ⊹˚• \`『 Venta 』\` •˚⊹:･ﾟ•\n\n✿ *Vendido »* ${p.name}\n✿ *Precio »* +${(p.value || 0).toLocaleString()} ${global.moneda}\n\n> *${global.botname2} • ${global.dev}*`);
    } catch (e) {
      console.error('[vender]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
