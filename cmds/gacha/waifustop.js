// .waifustop — personajes con mayor valor del catálogo.
import { personajes } from '../../lib/gacha.js';

export default {
  command: ['waifustop', 'wtop', 'topwaifus'],
  category: 'gacha',
  desc: 'Top personajes por valor',
  run: async ({ msg }) => {
    try {
      const top = [...personajes()].sort((a, b) => (b.value || 0) - (a.value || 0)).slice(0, 10);
      const txt = top.map((c, i) => `${i + 1}. ${c.name} — ${(c.value || 0).toLocaleString()} ${global.moneda}`).join('\n');
      await msg.reply(`• :･ﾟ⊹˚• \`『 Top Waifus 』\` •˚⊹:･ﾟ•\n\n${txt}\n\n> *${global.botname2} • ${global.dev}*`);
    } catch {
      await msg.reply(global.msgglobal);
    }
  }
};
