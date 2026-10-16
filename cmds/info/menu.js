import fs from 'fs';

const BANNER_URL = 'https://Shadow-TermDev.github.io/assets/shadowdev-banner-mini.jpg';

function fmt(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  return `${h % 24}h ${m % 60}m ${s % 60}s`;
}

export default {
  command: ['menu', 'help', 'allmenu'],
  category: 'info',
  desc: 'Muestra este menú',
  run: async ({ msg, sock, args, prefix, fromAgent }) => {
    try {
      const seen = new Set();
      const cats = new Map();
      for (const c of global.cmds.values()) {
        if (seen.has(c.run)) continue;
        seen.add(c.run);
        const cat = c.category || 'otros';
        if (!cats.has(cat)) cats.set(cat, []);
        cats.get(cat).push(c);
      }
      const totalCmds = [...cats.values()].reduce((n, l) => n + l.length, 0);
      const users = global.seenUsers?.size || 0;
      const uptime = fmt(Date.now() - (global.bootTime || Date.now()));
      const numero = msg.sender.split('@')[0];

      let head = `⋆｡ﾟ☁︎ Hola! Soy  *${global.botname2}*  ٩(˘◡˘)۶ ☁︎ﾟ｡⋆\n`;
      head += `> ${global.link}\n`;
      head += `˚₊· Aquí tienes la lista de comandos ·₊˚\n`;
      head += `╭┈ ↷\n`;
      head += `│✿ Cliente » @${numero}\n`;
      head += `│❀ Modo » Publico\n`;
      head += `│✦ Bot » Principal 🅥\n`;
      head += `│ⴵ Activada » ${uptime}\n`;
      head += `│✰ Usuarios » ${users}\n`;
      head += `│✧ Comandos » ${totalCmds}\n`;
      head += `│🜸 Baileys » Multi Device\n`;
      head += `╰─────────────────\n`;
      head += `· · • —– ٠ ✤ ٠ —– • · ·`;

      const ORDEN = ['economy', 'fun', 'gacha', 'downloader', 'grupo', 'info', 'ai', 'search', 'utils', 'owner'];
      const filtro = args[0]?.toLowerCase();
      const catsOrdenadas = [...cats.entries()].sort(([a], [b]) => {
        const ia = ORDEN.indexOf(a.toLowerCase());
        const ib = ORDEN.indexOf(b.toLowerCase());
        return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
      });
      let body = '';
      for (const [cat, cmds] of catsOrdenadas) {
        if (filtro && cat.toLowerCase() !== filtro) continue;
        const nombre = cat.charAt(0).toUpperCase() + cat.slice(1);
        body += `\n• :･ﾟ⊹˚• \`『 ${nombre} 』\` •˚⊹:･ﾟ•\n\n`;
        body += `❍ ${cmds[0]?.desc || 'Comandos disponibles.'}\n`;
        for (const c of cmds) {
          const alias = c.alias.map((a) => `${prefix}${a}`).join(' › ');
          body += `✿ *${alias}${c.uso ? ` + ${c.uso}` : ''}*\n`;
          body += `> ✐ ${c.desc || 'Sin descripción.'}\n`;
        }
      }
      const foot = `\n˚₊· 𓂃 *${global.botname2} • ${global.dev}* 𓂃 ·₊˚\n> ${global.link}`;
      const quoted = { quoted: { key: msg.key, message: {} } };

      // UN SOLO mensaje de texto: el caption corta en ~1024 y partía el menú
      await sock.sendMessage(
        msg.chat,
        { text: `${head}${body}${foot}`.trim(), contextInfo: { mentionedJid: [msg.sender] } },
        quoted
      );
      // fromAgent: el menú ES el contenido (no se reescribe); el agente suma su
      // línea de personalidad aparte con el resultado.
      if (fromAgent) return { ok: true, code: 'menu', data: { total: totalCmds, categorias: cats.size } };
    } catch (e) {
      console.error('Fail: [menu.js]', e?.stack || e);
      if (fromAgent) return { ok: false, code: 'error', data: {}, detail: e?.message };
      await msg.reply(global.msgglobal || 'Ocurrió un error al generar el menú.');
    }
  }
};
