// .vote — vota un personaje (+250 a su valor, 1 voto por persona).
import { saveUsers, todosUsuarios } from '../../lib/users.js';
import { personajes, votar } from '../../lib/gacha.js';

export default {
  command: ['vote', 'votar', 'voto'],
  category: 'gacha',
  desc: 'Vota por un personaje',
  uso: '<nombre>',
  run: async ({ msg, args }) => {
    try {
      const q = args.join(' ').toLowerCase();
      if (!q) return msg.reply('❍ Ej: *.vote* Asuna');
      const p = personajes().find((c) => c.name.toLowerCase().includes(q));
      if (!p) return msg.reply('❍ Ese personaje no existe en el catálogo.');
      const n = votar(p.name, msg.sender);
      if (!n) return msg.reply('❍ Ya votaste por ese personaje.');
      for (const [, u] of todosUsuarios()) {
        const c = (u.characters || []).find((x) => x.name === p.name);
        if (c) c.value = (c.value || 0) + 250;
      }
      saveUsers();
      await msg.reply(`✿ Votaste por *${p.name}* (+250 valor, ${n} voto${n > 1 ? 's' : ''}).\n\n> *${global.botname2} • ${global.dev}*`);
    } catch {
      await msg.reply(global.msgglobal);
    }
  }
};
