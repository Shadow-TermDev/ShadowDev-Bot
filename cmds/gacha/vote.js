// .vote — vota un personaje (+250 a su valor, 1 voto por persona).
import { saveUsers, todosUsuarios } from '../../lib/users.js';
import { buscarPersonaje, personajes, votar } from '../../lib/gacha.js';

export default {
  command: ['vote', 'votar', 'voto'],
  category: 'gacha',
  desc: 'Vota por un personaje',
  uso: '<nombre>',
  run: async ({ msg, args }) => {
    try {
      const q = args.join(' ').toLowerCase();
      if (!q) return msg.reply('❍ Ej: *.vote* Asuna');
      const idx = buscarPersonaje(personajes(), q);
      if (idx < 0) return msg.reply('❍ Ese personaje no existe en el catálogo.');
      const p = personajes()[idx];
      const n = votar(p.name, msg.sender);
      if (!n) return msg.reply('❍ Ya votaste por ese personaje.');
      let dueno = null;
      for (const [jid, u] of todosUsuarios()) {
        const c = (u.characters || []).find((x) => x.name === p.name);
        if (c) {
          c.value = (c.value || 0) + 250;
          dueno = jid;
        }
      }
      saveUsers();
      await msg.reply(
        dueno
          ? `✿ Votaste por *${p.name}* (+250 valor, ${n} voto${n > 1 ? 's' : ''}).`
          : `✿ Votaste por *${p.name}* (${n} voto${n > 1 ? 's' : ''}). Nadie lo posee, así que nadie recibe el +250.`
      );
    } catch (e) {
      console.error('[vote]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
