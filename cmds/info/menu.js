import { generateWAMessageFromContent, getUrlInfo } from '@whiskeysockets/baileys';

function fmt(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  return `${h % 24}h ${m % 60}m ${s % 60}s`;
}

export default {
  command: ['menu', 'help', 'allmenu'],
  category: 'info',
  desc: 'Ver la lista de comandos del bot',
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
      menu += `˚₊· Aquí tienes la lista de comandos ·₊˚\n`;
      menu += `╭┈ ↷\n`;
      menu += `│ᰔᩚ Cliente » @${numero}\n`;
      menu += `│❀ Modo » Publico\n`;
      menu += `│✦ Bot » Principal 🅥\n`;
      menu += `│ⴵ Activada » ${uptime}\n`;
      menu += `│✰ Usuarios » ${users}\n`;
      menu += `│✧ Comandos » ${totalCmds}\n`;
      menu += `│🜸 Baileys » Multi Device\n`;
      menu += `╰─────────────────\n`;
      menu += `· · • —– ٠ ✤ ٠ —– • · ·\n`;

      const filtro = args[0]?.toLowerCase();
      for (const [cat, cmds] of cats) {
        if (filtro && cat.toLowerCase() !== filtro) continue;
        const nombre = cat.charAt(0).toUpperCase() + cat.slice(1);
        menu += `\n• :･ﾟ⊹˚• \`『 ${nombre} 』\` •˚⊹:･ﾟ•\n\n`;
        menu += `❍ ${cmds[0]?.desc || 'Comandos disponibles.'}\n`;
        for (const c of cmds) {
          const alias = c.alias ? c.alias.map((a) => `${prefix}${a}`).join(' • ') : `${prefix}${c.command[0]}`;
          menu += `ᰔᩚ *${alias}*\n`;
          menu += `> ✦ ${c.desc || 'Sin descripción.'}${c.uso ? ` Uso: ${c.uso}` : ''}\n`;
        }
      }
      menu += `\n˚₊· 𓂃 *${global.botname2} • ${global.dev}* 𓂃 ·₊˚\n> ${global.link}`;

      // Generamos la vista previa nativa con getUrlInfo de Baileys
      const urlInfo = await getUrlInfo(global.link, {
        thumbnailWidth: 1024,
        fetchOpts: { timeout: 3000 }
      }).catch(() => null);

      const msgGenerated = generateWAMessageFromContent(
        msg.chat,
        {
          extendedTextMessage: {
            text: menu.trim(),
            contextInfo: {
              mentionedJid: [msg.sender],
              ...(urlInfo ? {
                canonicalUrl: global.link,
                matchedText: global.link,
                title: urlInfo.title || global.botname2,
                description: urlInfo.description || global.dev,
                jpegThumbnail: urlInfo.jpegThumbnail
              } : {})
            }
          }
        },
        { quoted: { key: msg.key, message: {} } }
      );

      await sock.relayMessage(msg.chat, msgGenerated.message, { messageId: msgGenerated.key.id });

    } catch (e) {
      console.error('Fail: [menu.js]', e?.stack || e);
      await msg.reply(global.msgglobal);
    }
  }
};
