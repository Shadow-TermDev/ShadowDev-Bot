// Menú principal — preview por URL (no llena la media del chat, estilo Hutao).
// El banner vive en https://Shadow-TermDev.github.io/assets/shadowdev-banner.png
import { prepareWAMessageMedia } from '@whiskeysockets/baileys';

export default {
  command: ['menu', 'help', 'allmenu'],
  category: 'info',
  desc: 'Muestra el menú de comandos',
  run: async ({ msg, sock, args, prefix }) => {
    try {
      const all = [...global.cmds.values()];
      const seen = new Set();
      const cats = {};
      for (const c of all) {
        if (seen.has(c.run)) continue;
        seen.add(c.run);
        const cat = c.category || 'otros';
        (cats[cat] ||= []).push(c);
      }

      const fecha = new Date().toLocaleDateString('es-PE', {
        timeZone: 'America/Lima',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      const hora = new Date().toLocaleTimeString('es-PE', {
        timeZone: 'America/Lima',
        hour: '2-digit',
        minute: '2-digit'
      });

      let menu = `> *¡Hola!* ${msg.pushName || 'amig@'}, soy *${global.botname2}* ʚ♡⃛ɞ\n\n`;
      menu += `✿ *Grupo:* ${global.dev}\n`;
      menu += `✿ *Web:* ${global.link}\n`;
      menu += `✿ *Fecha:* ${fecha} ${hora}\n\n`;
      menu += `⋆｡ﾟ☁︎ ｡° *COMANDOS* ﾟ｡˚₊ 𓂃\n`;

      const filtro = args[0]?.toLowerCase();
      for (const [cat, cmds] of Object.entries(cats)) {
        if (filtro && cat.toLowerCase() !== filtro) continue;
        const nombre = cat.charAt(0).toUpperCase() + cat.slice(1);
        menu += `\n╭─ *${nombre}*\n`;
        for (const c of cmds) {
          const alias = c.alias.map((a) => `${prefix}${a}`).join(' › ');
          menu += `│✿ ${alias}${c.uso ? ` + ${c.uso}` : ''}\n`;
          if (c.desc) menu += `> ✺ ${c.desc}\n`;
        }
        menu += `╰────────\n`;
      }
      menu += `\n> *${global.botname2} • ${global.dev}*`;

      // Preview con miniatura por URL: se ve el banner sin guardar imagen en la media
      let linkPreview;
      try {
        const { imageMessage } = await prepareWAMessageMedia(
          { image: { url: global.banner } },
          { upload: sock.waUploadToServer, mediaTypeOverride: 'thumbnail-link' }
        );
        linkPreview = {
          'canonical-url': global.link,
          'matched-text': global.link,
          title: global.botname,
          description: `${global.botname2} • ${global.dev}`,
          jpegThumbnail: imageMessage?.jpegThumbnail
            ? Buffer.from(imageMessage.jpegThumbnail)
            : undefined
        };
      } catch (e) {
        console.error('Fail menu preview:', e?.message || e);
        linkPreview = undefined;
      }

      await sock.sendMessage(
        msg.chat,
        { text: menu.trim(), linkPreview },
        { quoted: { key: msg.key, message: {} } }
      );
    } catch (e) {
      console.error('Fail: [menu.js]', e?.stack || e);
      await msg.reply(global.msgglobal);
    }
  }
};
