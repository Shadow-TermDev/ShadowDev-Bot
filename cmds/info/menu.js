import fs from 'fs';

// La imagen sale del caché de medios de Baileys (1 subida por arranque).
const BANNER_URL = 'https://Shadow-TermDev.github.io/assets/shadowdev-banner-mini.jpg';

function fmt(ms) {
// Si cambias la imagen, reemplaza ese archivo.
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
  run: async ({ msg, sock, args, prefix }) => {
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

      let menu = `⋆｡ﾟ☁︎ Hola! Soy  *${global.botname2}*  ٩(˘◡˘)۶ ☁︎ﾟ｡⋆\n`;
      menu += `> ${global.link}\n`;
      menu += `˚₊· Aquí tienes la lista de comandos ·₊˚\n`;
      menu += `╭┈ ↷\n`;
      menu += `│✿ Cliente » @${numero}\n`;
      menu += `│❀ Modo » Publico\n`;
      menu += `│✦ Bot » Principal 🅥\n`;
      menu += `│ⴵ Activada » ${uptime}\n`;
      menu += `│✰ Usuarios » ${users}\n`;
      menu += `│✧ Comandos » ${totalCmds}\n`;
      menu += `│🜸 Baileys » Multi Device\n`;
      menu += `╰─────────────────\n`;
      menu += `· · • —– ٠ ✤ ٠ —– • · ·\n`;

      const ORDEN = ['economy', 'fun', 'gacha', 'downloader', 'grupo', 'info', 'ai', 'search', 'utils', 'owner'];
      const filtro = args[0]?.toLowerCase();
      const catsOrdenadas = [...cats.entries()].sort(([a], [b]) => {
        const ia = ORDEN.indexOf(a.toLowerCase());
        const ib = ORDEN.indexOf(b.toLowerCase());
        return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
      });
      for (const [cat, cmds] of catsOrdenadas) {
        if (filtro && cat.toLowerCase() !== filtro) continue;
        const nombre = cat.charAt(0).toUpperCase() + cat.slice(1);
        menu += `\n• :･ﾟ⊹˚• \`『 ${nombre} 』\` •˚⊹:･ﾟ•\n\n`;
        menu += `❍ ${cmds[0]?.desc || 'Comandos disponibles.'}\n`;
        for (const c of cmds) {
          const alias = c.alias.map((a) => `${prefix}${a}`).join(' › ');
          menu += `✿ *${alias}${c.uso ? ` + ${c.uso}` : ''}*\n`;
          menu += `> ✐ ${c.desc || 'Sin descripción.'}\n`;
        }
      }
      menu += `\n˚₊· 𓂃 *${global.botname2} • ${global.dev}* 𓂃 ·₊˚`;

      // Un solo menú por chat: edita el anterior en vez de acumular imágenes
      global.menuKeys ||= new Map();
      const prev = global.menuKeys.get(msg.chat);
      try {
        const banner = fs.readFileSync('./media/banner.jpg');
        if (prev) {
          try {
            await sock.sendMessage(msg.chat, { image: banner, caption: menu.trim(), mentions: [msg.sender], edit: prev });
            return;
          } catch (e) {
            console.error('[menu] no se pudo editar, reenvío:', e?.message || e);
          }
        }
        const sent = await sock.sendMessage(
          msg.chat,
          { image: banner, caption: menu.trim(), mentions: [msg.sender] },
          { quoted: { key: msg.key, message: {} } }
        );
        if (sent?.key) global.menuKeys.set(msg.chat, sent.key);
      } catch (e) {
        console.error('[menu] sin banner local, texto plano:', e?.message || e);
        await sock.sendMessage(
          msg.chat,
          { text: menu.trim(), contextInfo: { mentionedJid: [msg.sender] } },
          { quoted: { key: msg.key, message: {} } }
        );
      }

    } catch (e) {
      console.error('Fail: [menu.js]', e?.stack || e);
      await msg.reply(global.msgglobal);
    }
  }
};
