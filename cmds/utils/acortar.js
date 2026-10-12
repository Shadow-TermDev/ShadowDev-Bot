// .acortar — acorta links con TinyURL (gratis, sin key).
import fetch from 'node-fetch';

export default {
  command: ['acortar', 'short', 'tiny'],
  category: 'utils',
  desc: 'Acorta un enlace largo',
  uso: '<url>',
  run: async ({ msg, args }) => {
    try {
      const url = args.find((a) => /^https?:\/\//i.test(a));
      if (!url) return msg.reply('❍ Envía un link válido. Ej: *.acortar* https://ejemplo.com/muy/largo');
      const short = (await (await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`)).text()).trim();
      if (!short.startsWith('http')) return msg.reply('❍ No se pudo acortar.');
      await msg.reply(`• :･ﾟ⊹˚• \`『 Acortador 』\` •˚⊹:･ﾟ•\n\nᰔᩚ *Corto »* ${short}\nᰔᩚ *Original »* ${url.slice(0, 60)}${url.length > 60 ? '...' : ''}\n\n> *${global.botname2} • ${global.dev}*`);
    } catch (e) {
      console.error('[acortar]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
