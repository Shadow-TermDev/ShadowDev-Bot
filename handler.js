// Router de comandos con prefijos . / ! # (estilo Hutao).
import chalk from 'chalk';
import { parsearNombre, responderBot } from './lib/ia.js';
import { baseJid, botJid, isAdminOf, pidOf, realPhone } from './lib/grupo.js';
import { addWarn, clearWarns, getChat } from './lib/chats.js';
import { addCoins, displayName, getUser, setApodo, touchUser } from './lib/users.js';

const LINKRE = /(https?:\/\/)?(chat\.whatsapp\.com\/[0-9A-Za-z]{20,24}|whatsapp\.com\/channel\/[0-9A-Za-z]{20,24})/i;
global.spamMap ||= new Map();
global.spamWarn ||= new Map();

const PREFIXES = ['.', '/', '!', '#'];
const KEYWORDS = /\b(shadowdev|shadow|dev|bot|samy)\b/i;

const FALLBACK = [
  '¿Me llamaban? Soy *ShadowDev*, usa *.menu* y ve lo que sé hacer.',
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

    // Anti-link + anti-spam (solo grupos, nunca a admins)
    if (m.isGroup && m.body) {
      try {
        const cfg = getChat(m.chat);
        if (cfg.antilink || cfg.antispam) {
          const meta = await sock.groupMetadata(m.chat).catch(() => null);
          const admin = meta ? isAdminOf(meta, m.sender) : true;
          const botAdmin = meta ? isAdminOf(meta, botJid(sock)) : false;
          if (meta && !admin && botAdmin) {
            if (cfg.antilink && LINKRE.test(m.body)) {
              // Propio link del grupo: permitido
              let propio = false;
              try {
                const code = await sock.groupInviteCode(m.chat);
                if (code && m.body.includes(code)) propio = true;
              } catch {}
              if (!propio) {
                await sock.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: m.key.id, participant: m.key.participant } }).catch(() => {});
                const n = addWarn(m.chat, baseJid(m.sender));
                if (n >= (cfg.warnLimit || 3)) {
                  clearWarns(m.chat, baseJid(m.sender));
                  await sock.groupParticipantsUpdate(m.chat, [pidOf(meta, m.sender)], 'remove').catch(() => {});
                  await sock.sendMessage(m.chat, { text: `❍ *@${baseJid(m.sender)}* eliminado por anti-link.`, mentions: [m.sender] });
                } else {
                  await sock.sendMessage(m.chat, { text: `❍ Nada de links aquí (@${baseJid(m.sender)} aviso ${n}/${cfg.warnLimit || 3}).`, mentions: [m.sender] });
                }
                return;
              }
            }
            if (cfg.antispam) {
              const k = `${m.chat}:${baseJid(m.sender)}`;
              const now = Date.now();
              const arr = (global.spamMap.get(k) || []).filter((e) => now - e.t < 8000);
              arr.push({ t: now, id: m.key.id, participant: m.key.participant });
              global.spamMap.set(k, arr);
              if (arr.length > 10) {
                global.spamMap.set(k, []);
                let borrados = 0;
                for (const e of arr) {
                  try {
                    await sock.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: e.id, participant: e.participant } });
                    borrados++;
                  } catch {}
                }
                global.spamOff ||= new Map();
                const prev = global.spamOff.get(k) || 0;
                if (now - prev < 5 * 60 * 1000) {
                  // Reincidente en 5min: fuera
                  global.spamOff.delete(k);
                  await sock.groupParticipantsUpdate(m.chat, [pidOf(meta, m.sender)], 'remove').catch(() => {});
                  await sock.sendMessage(m.chat, { text: `❍ *@${baseJid(m.sender)}* expulsado por spam.`, mentions: [m.sender] });
                } else {
                  global.spamOff.set(k, now);
                  await sock.sendMessage(m.chat, { text: `❍ Afloja el spam, @${baseJid(m.sender)} (${borrados} mensajes borrados, a la próxima te vas).`, mentions: [m.sender] });
                }
                return;
              }
            }
          }
        }
      } catch (e) {
        console.error('[filtros]', e?.message || e);
      }
    }
    const text = (m.body || '').trim();
    if (!text) return;
    // Owner temprano (lo necesitan los gates de apagado)
    const ownerBases = (global.owner || []).map((n) => baseJid(n));
    let senderBase = baseJid(m.sender);
    let isOwner = ownerBases.includes(senderBase);
    if (!isOwner && String(m.sender || '').endsWith('@lid')) {
      try {
        senderBase = await realPhone(sock, m.chat, m.sender);
      } catch {}
      isOwner = ownerBases.includes(senderBase);
    }
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
        const raw = await responderBot(text, userName + (esNuevo ? ' (nuevo, no sabes su nombre: preséntate y pregúntale cómo se llama)' : ''));
        const { text: out, nombre } = parsearNombre(raw);
        if (nombre && m.sender) {
          const actual = displayName(m.sender, m.pushName).toLowerCase();
          if (nombre.toLowerCase() !== actual && getUser(m.sender).apodo !== nombre) {
            setApodo(m.sender, nombre);
            console.log(`[kw] nombre guardado: ${nombre} (${m.sender.split('@')[0]})`);
          }
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

    // isOwner ya calculado arriba (línea ~79)
    // Toggles por grupo (los comandos toggle siempre pasan)
    if (m.isGroup && !['bot', 'botcito'].includes(command)) {
      const cfg = getChat(m.chat);
      if (cfg.botOff) return m.reply('❍ El bot está *apagado* en este grupo.');
      if (cfg.onlyAdmin && !isOwner) {
        try {
          const meta = await sock.groupMetadata(m.chat);
          const ok = isAdminOf(meta, m.sender);
          console.log(`[gate] onlyAdmin sender=${m.sender} esAdmin=${ok} parts=${meta?.participants?.length || 0}`);
          if (!ok) return m.reply('❍ Solo los admins pueden usar el bot por ahora.');
        } catch (e) {
          console.error('[gate] onlyAdmin sin metadata:', e?.message || e);
          return;
        }
      }
      if (cfg.economyOff && cmd.category === 'economy' && !isOwner) {
        return m.reply('❍ Economía apagada aquí. Un admin la enciende con *.economy on*.');
      }
      if (cfg.gachaOff && cmd.category === 'gacha' && !isOwner) {
        return m.reply('❍ Gacha apagado aquí. Un admin lo enciende con *.gacha on*.');
      }
    }

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
      if (m.sender) addCoins(m.sender, 10); // +10 monedas por comando usado
    } catch {}
    console.log(chalk.gray(`[ ✿ ] Respuesta enviada → ${prefix}${command} (${Date.now() - t0}ms)`));
  } catch (e) {
    console.error(chalk.red(`[ ✿ ] Falló ${typeof command !== 'undefined' ? prefix + command : 'comando'}: ${e?.message || e}`));
    try {
      await m.reply(global.msgglobal);
    } catch {}
  }
}
