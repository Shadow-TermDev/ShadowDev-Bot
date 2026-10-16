// ShadowDev-Bot — Agente inteligente único (v3.2.0).
// Reemplaza lib/intents.js: clasifica CHARLA | CONSULTA | ACCIÓN,
// conoce el catálogo real (global.cmds) + nivel de acceso,
// y ejecuta por lenguaje natural solo si el usuario tiene permiso.
//
// Roles: owner > admin de grupo > usuario normal.
//   - public → todos · admin → admins+owners · owner → solo owners
// Devuelve true si consumió el mensaje, false si es CHARLA
// (el handler cae a responderBot en ese caso).
import { checkGroup, isAdminOf } from './grupo.js';

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

// ── Catálogo dinámico + access ─────────────────────────────────
// Inferencia por defecto (mientras el comando no traiga `access` a mano):
//   info, fun, dl, downloader, ai, search, utils, economy, gacha → public
//   grupo → admin · owner → owner
const PUBLIC_CATS = new Set(['info', 'fun', 'dl', 'downloader', 'ai', 'search', 'utils', 'economy', 'gacha']);

export function inferAccess(category = '', explicit = '') {
  if (explicit === 'public' || explicit === 'admin' || explicit === 'owner') return explicit;
  const c = String(category || '').toLowerCase();
  if (c === 'owner') return 'owner';
  if (c === 'grupo') return 'admin';
  if (PUBLIC_CATS.has(c)) return 'public';
  return 'public';
}

export function buildCatalog() {
  const seen = new Set();
  const list = [];
  for (const c of global.cmds?.values() || []) {
    if (!c || seen.has(c.run)) continue;
    seen.add(c.run);
    list.push({
      alias: c.alias || [],
      desc: c.desc || '',
      uso: c.uso || '',
      category: c.category || 'otros',
      access: inferAccess(c.category, c.access),
      run: c.run
    });
  }
  return list;
}

function palabras(texto) {
  return norm(texto).split(/[^a-z0-9@#]+/).filter((w) => w.length > 2);
}

function puntuar(cmd, words) {
  let s = 0;
  const bolsa = norm([...(cmd.alias || []), cmd.desc || '', cmd.uso || '', cmd.category || ''].join(' '));
  for (const a of cmd.alias || []) if (words.includes(norm(a))) s += 10;
  for (const w of words) if (w.length > 3 && bolsa.includes(w)) s += 3;
  return s;
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

// ── Intenciones ACCIÓN: test + cómo armar args + comando destino ──
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
    cmd: 'apagar',
    test: (t) => /(apaga|apagar|apagalo|apagate|mata|matar|shutdown)/.test(t) && /(bot|botcito|todo|sistema)/.test(t),
    args: () => []
  },
  {
    cmd: 'promote',
    test: (t) => /(haz|vuelve|pon|dame).{0,15}admin|dale admin/.test(t),
    args: () => []
  },
  {
    cmd: 'add',
    test: (t) => /(agrega|agregar|anade|añade|invita|mete).{0,20}(grupo|chat)|agrega.{0,20}\d{7,}/.test(t),
    args: (t, orig) => {
      const nums = String(orig || '').match(/\+?\d{10,15}/g) || [];
      return nums.map((n) => n.replace(/\D/g, ''));
    }
  },
  {
    cmd: 'warn',
    test: (t) => /(warn|advierte|llama la atencion).{0,20}@|dame.{0,10}warn/.test(t),
    args: () => []
  },
  {
    cmd: 'tagall',
    test: (t) => /(etiqueta|menciona|llama).{0,20}(todos|todo el grupo)|tag.?all|invoca/.test(t),
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
    cmd: 'sticker',
    test: (t) => /(haz.*sticker|convierte.*sticker|sticker de esto|hazme un sticker)/.test(t),
    args: () => []
  },
  {
    cmd: 'translate',
    test: (t) => /(traduce|traducir)/.test(t),
    args: (t, orig) => {
      const m = norm(orig).match(/(?:al|en)\s+([a-z]+)\s*$/);
      const langs = { ingles: 'en', espanol: 'es', portugues: 'pt', frances: 'fr', italiano: 'it', aleman: 'de', japones: 'ja', chino: 'zh' };
      const lang = (m && langs[m[1]]) || 'en';
      const txt = limpiar(orig, ['traduce', 'traducir', 'al', 'en', m?.[1] || '___']);
      return txt ? [lang, ...txt.split(' ')] : [];
    }
  },
  {
    cmd: 'wiki',
    test: (t) => /(busca|que es|quien es|quién es|investiga|significa|informacion sobre|información sobre)/.test(t),
    args: (t, orig) => limpiar(orig, ['busca', 'buscar', 'que', 'es', 'quien', 'quién', 'investiga', 'significa', 'informacion', 'información', 'sobre', 'dime', 'acerca', 'de']).split(' ').filter(Boolean)
  },
  {
    cmd: 'rw',
    test: (t) => /(gacha|roll|waifu|reclama|personaje aleatorio)/.test(t),
    args: () => []
  }
];

// ── Clasificador CHARLA | CONSULTA | ACCIÓN (regex + score ligero) ──
const RE_CONSULTA = /(que (comandos|sabes|puedes|haces)|lista de|para que sirves|como (uso|se usa|funciona)|ayuda con|que hace el comando|info (del|de) comando|cuantos comandos|tutorial)/;

export function clasificar(texto, catalogo = []) {
  const t = norm(texto);
  if (!t || t.length < 2) return 'CHARLA';
  // CONSULTA explícita sobre el bot/catálogo
  if (RE_CONSULTA.test(t)) return 'CONSULTA';
  if (/(comando|menu|funcion|función|caracteristica|característica)/.test(t) && /(que| cual|cual|como|cómo|lista|tienes|hay)/.test(t)) return 'CONSULTA';
  // ACCIÓN por intención directa
  for (const it of INTENTS) {
    try {
      if (it.cmd === 'translate') {
        if (it.test(t)) {
          const a = it.args(t, texto);
          if (a.length) return 'ACCIÓN';
        }
        continue;
      }
      if (it.test(t)) return 'ACCIÓN';
    } catch {}
  }
  // ACCIÓN por score contra catálogo real
  const words = palabras(texto);
  let best = 0;
  for (const c of catalogo) {
    const s = puntuar(c, words);
    if (s > best) best = s;
  }
  if (best >= 8) return 'ACCIÓN';
  // CONSULTA débil: pregunta sobre algo que suena a comando sin verbo de acción
  if (/^(que|cu[aá]l|c[oó]mo|para que)\b/.test(t) && best >= 3) return 'CONSULTA';
  return 'CHARLA';
}

async function getRole(sock, m, isOwner) {
  if (isOwner) return 'owner';
  if (!m.isGroup) return 'user';
  try {
    const meta = await sock.groupMetadata(m.chat);
    if (isAdminOf(meta, m.sender)) return 'admin';
  } catch {}
  return 'user';
}

function canUse(required, role) {
  if (role === 'owner') return true;
  if (required === 'public') return true;
  if (required === 'admin' && role === 'admin') return true;
  return false;
}

function faltaDato(cmd) {
  // Heurística: comandos cuyo uso exige <...> y el agente no extrajo args
  const uso = String(cmd.uso || '');
  return /<[^>]+>/.test(uso);
}

function explicarComando(c, prefix = '.') {
  const alias = c.alias.map((a) => `${prefix}${a}`).join(' › ');
  return `✿ *${alias}${c.uso ? ` + ${c.uso}` : ''}*\n> ✦ ${c.desc || 'Sin descripción.'}`;
}

async function responderConsulta(sock, m, texto, catalogo) {
  const t = norm(texto);
  const words = palabras(texto);
  // 1) ¿Pregunta por un comando concreto?
  let mejor = null;
  let best = 0;
  for (const c of catalogo) {
    const s = puntuar(c, words);
    if (s > best) { best = s; mejor = c; }
  }
  if (mejor && best >= 8) {
    const nivel = mejor.access === 'owner' ? 'solo Owner' : mejor.access === 'admin' ? 'solo admins' : 'todos';
    await m.reply(`• :･ﾟ⊹˚• \`『 ${mejor.alias[0]} 』\` •˚⊹:･ﾟ•\n\n${explicarComando(mejor)}\n> ✐ Categoría *${mejor.category}* · lo usa: *${nivel}*.\n> ✦ Ej: *.${mejor.alias[0]}* ${mejor.uso || ''}`.trim());
    return true;
  }
  // 2) ¿Pregunta por categoría? (descarga/música/grupo/economía/gacha/...)
  const catHit = catalogo.length
    ? [...new Set(catalogo.map((c) => c.category))].find((cat) => t.includes(norm(cat)) || (cat === 'downloader' && /descarg|musica|video|tiktok|youtube/.test(t)) || (cat === 'grupo' && /grupo|admin/.test(t)) || (cat === 'economy' && /econom|moneda|dinero|mora/.test(t)) || (cat === 'gacha' && /gacha|waifu|roll|personaje/.test(t)) || (cat === 'ai' && /\bia\b|inteligencia/.test(t)) || (cat === 'search' && /busca|wiki|letra|investiga/.test(t)) || (cat === 'utils' && /hora|qr|traduc|acorta|link/.test(t)) || (cat === 'fun' && /divers|juego|chiste|amor/.test(t)))
    : null;
  const filtrados = catHit ? catalogo.filter((c) => c.category === catHit).slice(0, 12) : catalogo.slice(0, 0);
  if (catHit && filtrados.length) {
    const lineas = filtrados.map((c) => explicarComando(c)).join('\n');
    await m.reply(`• :･ﾟ⊹˚• \`『 ${catHit} 』\` •˚⊹:･ﾟ•\n\n${lineas}\n\n> ✦ Usa *.menu ${catHit}* para ver más.`);
    return true;
  }
  // 3) General: qué sé hacer
  const total = catalogo.length;
  const ejemplos = ['menu', 'play', 'hora', 'chiste', 'wiki', 'sticker'].filter((a) => catalogo.some((c) => c.alias.includes(a))).map((a) => `*.${a}*`).join(' · ') || '*.menu*';
  await m.reply(`✿ Soy *${global.botname2 || 'ShadowDev'}*: sé ${total} comandos.\n> ✦ Ejemplos: ${ejemplos}\n> ✦ Pídeme con palabras (“ponme tal canción”, “saca a @alguien”) o usa *.menu*.`);
  return true;
}

export async function tryAgent(sock, m, text, isOwner) {
  const catalogo = buildCatalog();
  const clase = clasificar(text, catalogo);
  if (clase === 'CHARLA') return false;
  if (clase === 'CONSULTA') {
    try {
      await responderConsulta(sock, m, text, catalogo);
      return true;
    } catch (e) {
      console.error('[agent-consulta]', e?.message || e);
      return false;
    }
  }

  // ── ACCIÓN: match en catálogo → permisos → datos → ejecutar ──
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
    for (const c of catalogo) {
      const s = puntuar(c, words);
      if (s > best) { best = s; pick = c.alias[0]; }
    }
    if (best < 8) return false;
    // Score genérico: los args son las palabras útiles (sin stopwords)
    const entry0 = catalogo.find((c) => c.alias.includes(pick));
    const quitar = [...(entry0?.alias || [])];
    args = limpiar(text, quitar).split(' ').filter(Boolean);
  }

  const entry = catalogo.find((c) => c.alias.includes(pick));
  const cmd = global.cmds?.get(pick);
  if (!cmd || !entry) return false;
  console.log(`[agent] ${m.pushName || m.sender} → ${pick} (${clase}) ${(args.join(' ') || '').slice(0, 60)}`);

  // Modo prueba: solo el owner usa el bot (NL y prefijo)
  if (global.testMode && !isOwner) {
    await m.reply('❍ Bot en *modo prueba*: solo el Owner puede usarme ahora.');
    return true;
  }

  // Permisos: normal solo public · admin public+admin · owner todo
  const role = await getRole(sock, m, isOwner);
  if (!canUse(entry.access, role)) {
    if (entry.access === 'owner') {
      await m.reply('❍ Eso solo lo usa el *Owner*.');
      return true;
    }
    await m.reply(global.mess?.admin || '❍ Este comando solo lo usan los *Admins del grupo*.');
    return true;
  }

  // Grupos: delega en checkGroup del propio comando, pero pide dato si falta
  if (entry.access === 'admin' || entry.category === 'grupo') {
    if (!m.isGroup) {
      await m.reply('❍ Este comando solo funciona en *grupos*.');
      return true;
    }
    try {
      const g = await checkGroup(sock, m);
      if (!g) return true;
    } catch {}
    const necesitaTarget = /menci|responder|número|numero|mensaje/i.test(cmd.uso || '');
    if (necesitaTarget && !(m.mentionedJid || []).length && !m.quotedSender && !args.some((a) => /\d{7,}/.test(a))) {
      await m.reply('❍ ¿A quién? Menciona, cita su mensaje o escribe el número.');
      return true;
    }
  }

  // Dato faltante (ej. "traduce", "baja eso" sin query)
  if (!args.length && faltaDato(cmd)) {
    await m.reply(`❍ Me faltó el dato. Ej: *.${entry.alias[0]}* ${cmd.uso || ''}`);
    return true;
  }

  try {
    const extra = {};
    if (pick === 'tiktok') extra.limit = parseCount(text, 10);
    await cmd.run({
      msg: m, m, sock, args, text: args.join(' '), command: cmd.alias[0] || pick,
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
