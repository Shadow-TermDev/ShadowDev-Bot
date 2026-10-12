// Router de comandos con prefijos . / ! # (estilo Hutao).
import chalk from 'chalk';
import { SYSTEM_BOT, parsearNombre, preguntarIA } from './lib/ia.js';
import { baseJid } from './lib/grupo.js';
import { addCoins, displayName, getUser, setApodo, touchUser } from './lib/users.js';

const PREFIXES = ['.', '/', '!', '#'];
const KEYWORDS = /\b(shadowdev|shadow|dev|bot|samy)\b/i;

const FALLBACK = [
  '¿Me llamaban? 👀 Soy *ShadowDev*, usa *.menu* y ve lo que sé hacer.',
  'Aquí ando ✦ Prueba con *.menu*.'
];

export default async function handler(sock, m) {
  try {
    if (m.fromMe) return; // anti-loop: ignora mensajes propios
    try {
      const yo = [sock.user?.id, sock.user?.lid].filter(Boolean).map(baseJid);
      if (yo.includes(baseJid(m.sender))) return; // otra sesión de mi propio número
    } catch {}
    global.seenUsers ||= new Set();
    if (m.sender) global.seenUsers.add(m.sender);
    if (m.sender) touchUser(m.sender, m.pushName);
    const userName = m.sender ? displayName(m.sender, m.pushName) : 'alguien';
    const text = (m.body || '').trim();
    if (!text) return;
    const prefix = PREFIXES.find((p) => text.startsWith(p));
    if (!prefix) {
      // Sin prefijo: responde a mención directa o palabras clave (con cooldown)
      const botIds = [sock.user?.id, sock.user?.lid]
        .filter(Boolean)
        .map((j) => String(j).split('@')[0].split(':')[0]);
      const mentioned =
        (m.mentionedJid || []).some((j) => botIds.includes(String(j).split('@')[0])) ||
        botIds.some((id) => id && text.includes('@' + id));
      const replyToBotJid = !!m.quotedSender && botIds.includes(String(m.quotedSender).split('@')[0].split(':')[0]);
      const quotedText = (m.quoted?.conversation || m.quoted?.extendedTextMessage?.text || '').slice(0, 120);
      const sent = global.botSent?.get(m.chat) || [];
      const replyToBotText = !!quotedText && sent.some((s) => s && (s.startsWith(quotedText.slice(0, 40)) || quotedText.startsWith(s.slice(0, 40))));
      const replyToBot = replyToBotJid || replyToBotText;
      const keyword = KEYWORDS.test(text);
      if (!mentioned && !keyword && !replyToBot) return;
      global.kwCooldown ||= new Map();
      const last = global.kwCooldown.get(m.chat) || 0;
      if (Date.now() - last < 20000) {
        console.log(chalk.gray(`[kw] cooldown (${mentioned ? 'mención' : replyToBot ? 'respuesta' : 'keyword'}) ${m.pushName || m.sender}`));
        return;
      }
      global.kwCooldown.set(m.chat, Date.now());
      console.log(chalk.gray(`[kw] ${mentioned ? 'mención' : replyToBot ? 'respuesta' : 'keyword'} de ${m.pushName || m.sender}: ${text.slice(0, 80)}`));
      try {
        const ficha = getUser(m.sender);
        const esNuevo = !ficha.apodo && (ficha.msgs || 0) <= 5;
        const raw = await preguntarIA(
          `En el chat dicen: "${text.slice(0, 300)}"`,
          `${SYSTEM_BOT}\nEstás hablando con ${userName}.` +
          (esNuevo ? `\nEs alguien NUEVO y no sabes su nombre: preséntate en una línea y pregúntale cómo se llama.` : '')
        );
        const { text: out, nombre } = parsearNombre(raw);
        if (nombre && m.sender && getUser(m.sender).apodo !== nombre) {
          setApodo(m.sender, nombre);
          console.log(`[kw] nombre guardado: ${nombre} (${m.sender.split('@')[0]})`);
        }
        if (out && !/^\s*\{[^}]*\}\s*$/.test(out)) {
          await m.reply(out);
          return;
        }
      } catch (e) {
        console.error('[kw-ia]', e?.message || e);
      }
      await m.reply(FALLBACK[Math.floor(Math.random() * FALLBACK.length)]);
      return;
    }

    const [raw, ...rest] = text.slice(prefix.length).trim().split(/\s+/);
    if (!raw) return;
    const command = raw.toLowerCase();
    const args = rest;
    const cmdText = args.join(' ');

    const cmd = global.cmds?.get(command);
    if (!cmd) {
      await m.reply(`❍ El comando *${prefix}${command}* no existe.\n> ✦ Usa *${prefix}menu* para ver la lista.`);
      return;
    }

    // Log estilo Hutao
    const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Lima' }));
    const pad = (n) => String(n).padStart(2, '0');
    const hora = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${String(d.getFullYear()).slice(2)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    console.log(`
𝄢 · • —– ٠ ✤ ٠ —– • · · • —– ٠ ✤ ٠ —– • ·✧༄
❚ ▸ ${chalk.cyan('𝐁𝐎𝐓 ❱❱')} ${chalk.bgMagenta(chalk.white.italic(sock.user?.name || global.botname2))}
❚ ▸ ${chalk.cyan('𝐇𝐎𝐑𝐀𝐑𝐈𝐎 ❱❱')} ${chalk.black.bgWhite(hora)}
❚ ${chalk.magentaBright('°o.OO.o°°o.OO.o°°o.OO.o°')}
❚ ▸ ${chalk.green('𝐔𝐒𝐔𝐀𝐑𝐈𝐎 ❱❱')} ${chalk.white(m.pushName || 'Sin nombre')} / ${chalk.bgMagentaBright.bold(m.isGroup ? 'Grupo' : 'Chat Private')}
❚ ▸ ${chalk.green('𝐂𝐎𝐌𝐀𝐍𝐃𝐎 ❱❱')} ${chalk.magentaBright(command || 'No Command')}
❚ ${chalk.magentaBright('°o.OO.o°°o.OO.o°°o.OO.o°')}
❚ ▸ ${chalk.redBright('𝐓𝐈𝐏𝐎 ❱❱')} ${chalk.greenBright.bold('[Bot Log]')}
𝄢 · • —– ٠ ✤ ٠ —– • · · • —– ٠ ✤ ٠ —– • ·✧༄`.trim());

    const isOwner = global.owner
      .map((n) => n + '@s.whatsapp.net')
      .includes(m.sender);

    const t0 = Date.now();
    await cmd.run({
      msg: m,
      m,
      sock,
      args,
      text: cmdText,
      command,
      prefix,
      usedPrefix: prefix,
      isOwner
    });
    try {
      if (m.sender) addCoins(m.sender, 10); // +10 🪙 por comando usado
    } catch {}
    console.log(chalk.gray(`[ ✿ ] Respuesta enviada → ${prefix}${command} (${Date.now() - t0}ms)`));
  } catch (e) {
    console.error(chalk.red(`[ ✿ ] Falló ${typeof command !== 'undefined' ? prefix + command : 'comando'}: ${e?.message || e}`));
    try {
      await m.reply(global.msgglobal);
    } catch {}
  }
}
