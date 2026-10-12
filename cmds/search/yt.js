// .yt — busca en YouTube y lista resultados (sin descargar).
import ytsearch from 'yt-search';

export default {
  command: ['yt', 'youtube'],
  category: 'search',
  desc: 'Busca videos en YouTube',
  uso: '<texto>',
  run: async ({ msg, args }) => {
    try {
      const q = args.join(' ');
      if (!q) return msg.reply('❍ Escribe qué buscar. Ej: *.yt* gatitos');
      const r = await ytsearch(q);
      const vids = (r.videos || []).slice(0, 5);
      if (!vids.length) return msg.reply('❍ Sin resultados.');
      const txt = vids.map((v, i) => `ᰔᩚ *${i + 1}.* ${v.title}\n> ✦ ${v.timestamp || ''} • ${(v.views || 0).toLocaleString()} vistas\n> ${v.url}`).join('\n\n');
      await msg.reply(`• :･ﾟ⊹˚• \`『 YouTube 』\` •˚⊹:･ﾟ•\n\n${txt}\n\n> *${global.botname2} • ${global.dev}*`);
    } catch (e) {
      console.error('[yt]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
