// Agente: lenguaje natural → comando real (determinista por puntaje, sin IA).
// Lo que no alcanza umbral va al respondedor conversacional.
import { checkGroup } from './grupo.js';

const norm = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

const STOP = new Set(
  'oye hey bot shadowdev shadow dev samy por favor favor un una el la los las de del en mi me que puedes puede quiero quieres puedes haz hazme dime dame muestra muestrame ver abre ensena enséñame pon ponme pasa pasame el la lo les nos se a al y oye'.split(' ')
);

function limpiar(texto, quitar = []) {
  const extra = new Set(quitar.map((w) => norm(w)));
  return String(texto || '')
    .split(/\s+/)
    .filter((w) => {
      const n = norm(w).replace(/[^a-z0-9]/g, '');
      return n.length > 1 && !STOP.has(n) && !extra.has(n);
    })
    .join(' ');
}

// Cada intención: test + cómo armar args + comando
const INTENTS = [
  {
    cmd: 'menu',
    test: (t) => /(muestrame|muestra|ver|abre|ensena).{0,20}menu|^menu$|lista de comandos/.test(t),
    args: () => []
  },
  {
    cmd: 'kick',
    test: (t) => /(expulsa|saca|echa|corre del grupo|fuera del grupo)/.test(t),
    args: () => []
  },
  {
    cmd: 'promote',
    test: (t) => /(haz|vuelve|pon|dame).{0,15}admin|dale admin/.test(t),
    args: () => []
  },
  {
    cmd: 'tiktok',
    test: (t) => /(tiktok|\btt\b)/.test(t),
    args: (t, orig) => limpiar(orig, ['tiktok', 'tt', 'video', 'videos', 'busca', 'buscar', 'descarga', 'baja']).split(' ').filter(Boolean)
  },
  {
    cmd: 'play',
    test: (t) => /(descarga|baja|pon|reproduce|reproducir|escuchar|quiero escuchar|ponme|canta|musica|cancion)/.test(t),
    args: (t, orig) => limpiar(orig, ['descarga', 'descargar', 'baja', 'bajar', 'pon', 'ponme', 'reproduce', 'reproducir', 'escuchar', 'quiero', 'canta', 'cantar', 'musica', 'cancion', 'audio', 'video', 'youtube', 'spotify']).split(' ').filter(Boolean)
  },
  {
    cmd: 'hora',
    test: (t) => /(que hora es|dime la hora|la hora|hora actual)/.test(t),
    args: () => []
  },
  {
    cmd: 'chiste',
    test: (t) => /(cuenta.*chiste|chiste|hazme reir|hazme reír)/.test(t),
    args: () => []
  },
  {
    cmd: 'translate',
    test: (t) => /(traduce|traducir)/.test(t),
    args: (t, orig) => {
      const m = norm(orig).match(/(?:al|en)\s+([a-z]+)\s*$/);
      const langs = { ingles: 'en', espanol: 'es', portugues: 'pt', frances: 'fr', italiano: 'it', aleman: 'de', japones: 'ja', chino: 'zh', inglesbritanico: 'en' };
      const lang = (m && langs[m[1]]) || 'en';
      const txt = limpiar(orig, ['traduce', 'traducir', 'al', 'en', m?.[1] || '___']);
      return txt ? [lang, ...txt.split(' ')] : [];
    }
  },
  {
    cmd: 'wiki',
    test: (t) => /(busca|que es|quien es|quién es|investiga|significa|informacion sobre|información sobre)/.test(t),
    args: (t, orig) => limpiar(orig, ['busca', 'buscar', 'que', 'es', 'quien', 'quién', 'investiga', 'significa', 'informacion', 'información', 'sobre', 'dime', 'acerca', 'de']).split(' ').filter(Boolean)
  }
];

function catalogo() {
  const seen = new Set();
  const list = [];
  for (const c of global.cmds?.values() || []) {
    if (seen.has(c.run)) continue;
    seen.add(c.run);
    list.push(c);
  }
  return list;
}

function puntuar(cmd, words) {
  let s = 0;
  const bolsa = norm([...cmd.alias, cmd.desc || '', cmd.uso || '', cmd.category || ''].join(' '));
  for (const a of cmd.alias) if (words.includes(norm(a))) s += 10;
  for (const w of words) if (w.length > 3 && bolsa.includes(w)) s += 3;
  return s;
}

function palabras(texto) {
  return norm(texto).split(/[^a-z0-9@#]+/).filter((w) => w.length > 2);
}

// Cantidades en español: "un video"→1, "5 videos"→5, "todos"→10
const NUMEROS = { un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10 };
function parseCount(texto, defecto = 10) {
  const t = norm(texto);
  const m = t.match(/(\d+)\s*(videos?|fotos?|audios?|videos?)?/);
  if (m) return Math.min(Math.max(parseInt(m[1], 10) || defecto, 1), 10);
  for (const [pal, n] of Object.entries(NUMEROS)) {
    if (new RegExp(`\\b${pal}\\b\\s*(video|foto|audio|imagen)`).test(t)) return n;
  }
  if (/(solo|solamente|único|unico|ese|este|el)\s+(video|foto|audio)/.test(t)) return 1;
  return defecto;
}

export async function tryAgent(sock, m, text, isOwner) {
  const t = norm(text);
  let pick = null;
  let args = String(text || '').trim().split(/\s+/).filter(Boolean);
  for (const it of INTENTS) {
    try {
      if (it.test(t)) {
        const a = it.args(t, text);
        if (it.cmd === 'translate' && !a.length) continue;
        pick = it.cmd;
        args = a;
        break;
      }
    } catch {}
  }
  if (!pick) {
    const words = palabras(text);
    let best = 0;
    for (const c of catalogo()) {
      const s = puntuar(c, words);
      if (s > best) {
        best = s;
        pick = c.alias[0];
      }
    }
    if (best < 8) return false;
  }
  const cmd = global.cmds?.get(pick);
  if (!cmd) return false;
  console.log(`[agent] ${m.pushName || m.sender} → ${pick} ${(args.join(' ') || '').slice(0, 60)}`);

  const entry = catalogo().find((c) => c.run === cmd.run);
  const cat = entry?.category || '';
  if (cat === 'owner' && !isOwner) {
    await m.reply('❍ Eso solo lo usa el *Owner*.');
    return true;
  }
  if (cat === 'grupo') {
    const g = await checkGroup(sock, m);
    if (!g) return true;
    const necesitaTarget = /menci|responder|número|mensaje/i.test(cmd.uso || '');
    if (necesitaTarget && !(m.mentionedJid || []).length && !m.quotedSender) {
      await m.reply(`❍ ¿A quién? Menciona, cita o escribe el número.`);
      return true;
    }
  }
  try {
    const extra = {};
    if (pick === 'tiktok') extra.limit = parseCount(text, 10);
    await cmd.run({
      msg: m, m, sock, args, text: args.join(' '), command: cmd.alias[0],
      prefix: '.', usedPrefix: '.', isOwner: !!isOwner, ...extra
    });
    return true;
  } catch (e) {
    console.error('[agent-exec]', e?.message || e);
    const msgErr = String(e?.message || e);
    if (/not-authorized|forbidden|privacy|blocked|invite/i.test(msgErr) && pick === 'add') {
      try {
        const code = await sock.groupInviteCode(m.chat);
        await m.reply(`❍ No pude agregarlo directo (privacidad de WhatsApp).\n> ✐ Invítalo con este link:\nhttps://chat.whatsapp.com/${code}`);
        return true;
      } catch {}
    }
    await m.reply('❍ Lo intenté pero algo falló. Prueba el comando directo (mira *.menu*).');
    return true;
  }
}
