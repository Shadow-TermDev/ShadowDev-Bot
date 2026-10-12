import { Jimp } from 'jimp';
import fs from 'fs';

// Miniatura en disco (./cache) + memoria: se genera 1 vez y el menú vuela.
// Si cambias el banner, borra ./cache/menu-thumb.jpg
const CACHE_FILE = './cache/menu-thumb.jpg';
let thumbCache = null;

async function bannerThumb() {
  if (thumbCache) return thumbCache;
  try {
    const b = fs.readFileSync(CACHE_FILE);
    if (b.length > 5000) {
      thumbCache = b;
      return b;
    }
  } catch {}
  const page = await (await fetch(global.link, { signal: AbortSignal.timeout(15000) })).text();
  const og = page.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1];
  if (!og) throw new Error('sin og:image');
  const buf = Buffer.from(await (await fetch(og, { signal: AbortSignal.timeout(25000) })).arrayBuffer());
  if (buf.length < 5000) throw new Error('imagen vacía');
  thumbCache = await (await Jimp.read(buf)).resize({ w: 600 }).getBuffer('image/jpeg');
  try {
    fs.mkdirSync('./cache', { recursive: true });
    fs.writeFileSync(CACHE_FILE, thumbCache);
  } catch {}
  return thumbCache;
}

// Precalienta el caché en 2do plano tras conectar
export async function warmBanner() {
  try {
    await bannerThumb();
    console.log('[preview] caché listo');
  } catch (e) {
    console.error('[preview] warmup:', e?.message || e);
  }
}
global.warmBanner = warmBanner;

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
          const alias = c.alias.map((a) => `${prefix}${a}`).join(' › ');
          menu += `ᰔᩚ *${alias}${c.uso ? ` + ${c.uso}` : ''}*\n`;
          menu += `> ✦ ${c.desc || 'Sin descripción.'}\n`;
        }
      }
      menu += `\n˚₊· 𓂃 *${global.botname2} • ${global.dev}* 𓂃 ·₊˚\n> ${global.link}`;

      // Preview clásico a nivel mensaje: es lo único que WhatsApp entrega
      // en este entorno (externalAdReply = descarte silencioso, probado 2 veces).
      const content = { text: menu.trim(), contextInfo: { mentionedJid: [msg.sender] } };
      try {
        const thumbBuffer = await bannerThumb();
        content.linkPreview = {
          'canonical-url': global.link,
          'matched-text': global.link,
          title: global.botname,
          description: `${global.botname2} • ${global.dev}`,
          jpegThumbnail: thumbBuffer
        };
      } catch (e) {
        console.error('[preview] texto plano:', e?.message || e);
      }

      await sock.sendMessage(msg.chat, content, { quoted: { key: msg.key, message: {} } });

    } catch (e) {
      console.error('Fail: [menu.js]', e?.stack || e);
      await msg.reply(global.msgglobal);
    }
  }
};
