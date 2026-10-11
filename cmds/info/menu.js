// Menú principal — banner local + link del grupo (sin URLs externas que se caigan).
import fs from 'fs';

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

      // Banner local: nunca falla por APIs caídas
      try {
        const banner = fs.readFileSync(global.banner);
        await sock.sendMessage(
          msg.chat,
          { image: banner, caption: menu.trim() },
          { quoted: msg.key ? { key: msg.key, message: {} } : undefined }
        );
      } catch {
        await msg.reply(menu.trim());
      }
    } catch (e) {
      console.error('Fail: [menu.js]', e?.stack || e);
      await msg.reply(global.msgglobal);
    }
  }
};
