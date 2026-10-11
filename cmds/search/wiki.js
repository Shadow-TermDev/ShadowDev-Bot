// .wiki — Wikipedia en español (sin key, reciclado de Hutao).
import axios from 'axios';

export default {
  command: ['wiki', 'wikipedia'],
  category: 'search',
  desc: 'Busca en Wikipedia',
  uso: '<texto>',
  run: async ({ msg, args }) => {
    try {
      const text = args.join(' ');
      if (!text) return msg.reply('❍ Escribe lo que quieres buscar. Ej: *.wiki* Lima');
      const { data } = await axios.get('https://es.wikipedia.org/w/api.php', {
        params: { action: 'query', list: 'search', srsearch: text, format: 'json' },
        headers: { 'User-Agent': 'ShadowDev-Bot/1.0' }
      });
      const results = data?.query?.search || [];
      if (!results.length) return msg.reply('❍ Sin resultados en Wikipedia.');
      let out = `• :･ﾟ⊹˚• \`『 Wikipedia 』\` •˚⊹:･ﾟ•\n\nᰔᩚ *Búsqueda »* ${text}\n\n`;
      for (const r of results.slice(0, 3)) {
        out += `ᰔᩚ *${r.title}*\n> ✦ ${r.snippet.replace(/<[^>]+>/g, '')}\n\n`;
      }
      await msg.reply(out.trim());
    } catch (e) {
      console.error('[wiki]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
