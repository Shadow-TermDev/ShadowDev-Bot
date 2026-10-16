// ShadowDev-Bot — Agente inteligente único (v3.3.0).
// Clasifica CHARLA | CONSULTA | ACCIÓN, conoce el catálogo real (global.cmds)
// con nivel de acceso, tiene conciencia del grupo actual y ejecuta por lenguaje
// natural solo si el usuario tiene permiso.
//
// Roles: owner > admin de grupo > usuario normal.
//   - public → todos · admin → admins+owners · owner → solo owners
//
// Comandos con soporte de agente: reciben `fromAgent: true` y en vez de
// responder su plantilla RETORNAN { ok, code, data, detail }; el agente narra
// ese resultado con personalidad (IA) o con su plantilla por código si la IA
// no está disponible. Comandos sin soporte responden ellos mismos (media, etc.).
//
// Devuelve true si consumió el mensaje, false si es CHARLA
// (el handler cae a responderBot en ese caso).
import { botJid, isAdminOf } from './grupo.js';
import { narrarHecho } from './ia.js';

const norm = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

const STOP = new Set(
  'oye hey bot shadowdev shadow dev samy por favor favor un una el la los las de del en mi me que puedes puede quiero quieres puedes haz hazme dime dame muestra muestrame ver abre ensena enséñame pon ponme pasa pasame el la lo les nos se a al y oye'.split(' ')
);

// Preposiciones que chocan con alias de comandos ('del'): no cuentan para el score
const NO_MATCH = new Set(['del']);

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
  return norm(texto)
    .split(/[^a-z0-9@#]+/)
    .filter((w) => w.length > 2 && !NO_MATCH.has(w));
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
    cmd: 'demote',
    test: (t) => /(quita|quitar|retira|saca|qu[íi]tale).{0,20}admin|admin.{0,10}(quita|fuera)/.test(t),
    args: (t, orig) => (String(orig || '').match(/\+?\d{10,15}/g) || []).map((n) => n.replace(/\D/g, ''))
  },
  {
    cmd: 'kick',
    test: (t) => /(expulsa|saca|echa|corre del grupo|fuera del grupo)/.test(t),
    args: (t, orig) => (String(orig || '').match(/\+?\d{10,15}/g) || []).map((n) => n.replace(/\D/g, ''))
  },
  {
    cmd: 'apagar',
    test: (t) => /(apaga|apagar|apagalo|apagate|mata|matar|shutdown)/.test(t) && /(bot|botcito|todo|sistema)/.test(t),
    args: () => []
  },
  {
    cmd: 'promote',
    test: (t) => /(haz|vuelve|pon|dame).{0,15}admin|dale admin/.test(t),
    args: (t, orig) => (String(orig || '').match(/\+?\d{10,15}/g) || []).map((n) => n.replace(/\D/g, ''))
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
    args: (t, orig) => {
      const m = String(orig || '').match(/\bpor\s+(.+)$/i);
      return m ? m[1].split(/\s+/).filter(Boolean) : [];
    }
  },
  {
    cmd: 'del',
    test: (t) => /(borra|borrar|elimina|eliminar).{0,20}(mensaje|eso|esto)|^(borra|elimina)\b/.test(t),
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

// ── Conciencia de grupo ────────────────────────────────────────
// Preguntas tipo "¿cómo se llama el grupo?", "cuántos miembros tiene", "link del grupo"
function esPreguntaGrupo(t) {
  if (/\b(grupos|comandos|lista)\b/.test(t)) return false;
  const objeto =
    /(este|el|mi|del|nuestro)\s+(grupo|grupito|chat)\b/.test(t) ||
    /^(grupo|grupito)\b/.test(t) ||
    /(grupo|grupito)\s+(se llama|tiene)/.test(t);
  const tema = /(nombre|se llama|link|enlace|invitaci[oó]n|cu[aá]ntos|miembros|integrantes)/.test(t);
  return objeto && tema;
}

async function getContexto(sock, m, isOwner) {
  const ctx = { esGrupo: !!m.isGroup, meta: null, nombre: 'este chat', miembros: 0, botAdmin: false, rol: isOwner ? 'owner' : 'user' };
  if (!ctx.esGrupo) return ctx;
  try {
    ctx.meta = await sock.groupMetadata(m.chat);
  } catch {}
  if (ctx.meta) {
    ctx.nombre = ctx.meta.subject || 'el grupo';
    ctx.miembros = ctx.meta.participants?.length || 0;
    ctx.botAdmin = isAdminOf(ctx.meta, botJid(sock));
    if (ctx.rol === 'user' && isAdminOf(ctx.meta, m.sender)) ctx.rol = 'admin';
  }
  return ctx;
}

async function responderGrupo(sock, m, t, isOwner) {
  if (!m.isGroup) {
    await m.reply('✿ Esto es un chat privado, no un grupo. Aquí solo estamos tú y yo.\n> ✦ Mira *.menu* para ver lo que sé hacer.');
    return;
  }
  const ctx = await getContexto(sock, m, !!isOwner);
  const quiereLink = /(link|enlace|invitaci[oó]n)/.test(t);
  let link = null;
  if (quiereLink) {
    try {
      link = 'https://chat.whatsapp.com/' + (await sock.groupInviteCode(m.chat));
    } catch {}
  }
  const lineas = [`ᰔᩚ *Nombre »* ${ctx.nombre}`, `ᰔᩚ *Miembros »* ${ctx.miembros}`];
  if (quiereLink) lineas.push(`ᰔᩚ *Link »* ${link || 'no disponible (necesito ser admin del grupo)'}`);
  await m.reply(`• :･ﾟ⊹˚• \`『 Grupo 』\` •˚⊹:･ﾟ•\n\n${lineas.join('\n')}\n\n> *${global.botname2} • ${global.dev}*`);
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

// ── Narración de resultados del agente ─────────────────────────
// Plantillas por código: fallback si la IA no responde a tiempo
function fallbackNarracion(res) {
  const d = res.data || {};
  const quien = d.num ? `@${d.num}` : '';
  switch (res.code) {
    case 'added': return `✿ Listo, ya está dentro: agregué a ${quien || `${d.total || 1} al grupo`}.`;
    case 'partial': return `✿ Agregué a ${d.added}/${d.total}. Al resto no pude directo (privacidad); les mandé invitación${d.link ? `:\n${d.link}` : '.'}`;
    case 'privacy': return `❍ No pude agregarlos directo (privacidad de WhatsApp). Les mandé la invitación por privado${d.link ? ` y aquí va:\n${d.link}` : '.'}`;
    case 'kicked': return `✿ Fuera ${quien}. Que le vaya bien.`;
    case 'kick_failed': return `❍ No pude expulsar a ${quien} (¿es admin, creador o ya salió?).`;
    case 'kick_self': return '❍ Conmigo no, que me quedo sin grupo.';
    case 'promoted': return `✿ Ahora ${quien} es admin del grupo.`;
    case 'promote_failed': return `❍ No pude dar admin a ${quien} (¿es el creador o salió del grupo?).`;
    case 'already_admin': return `❍ ${quien} ya era admin.`;
    case 'demoted': return `✿ ${quien} ya no es admin.`;
    case 'demote_failed': return `❍ No pude quitarle admin a ${quien} (¿es el creador?).`;
    case 'not_admin': return `❍ ${quien} ni siquiera era admin.`;
    case 'warned': return `❍ Advertencia ${d.n}/${d.limite} para ${quien}${d.razon ? `: ${d.razon}.` : '.'}`;
    case 'warned_out': return `✿ ${quien} llegó al límite (${d.n}/${d.limite}) y voló del grupo.`;
    case 'deleted': return '✿ Mensaje borrado.';
    case 'nothing': return '❍ No había nada que borrar; cita el mensaje que quieres eliminar.';
    case 'need_target': return '❍ ¿A quién? Menciónalo, cita su mensaje o escribe el número.';
    case 'need_numbers': return '❍ Pásame los números con código país. Ej: *.add* 51912345678';
    default: return '❍ Lo intenté pero algo falló. Prueba el comando directo (mira *.menu*).';
  }
}

async function narrarResultado(sock, m, texto, entry, ctx, res) {
  const d = res.data || {};
  const quien = d.num || (d.mention ? String(d.mention).split('@')[0] : '');
  let out = '';
  try {
    const contexto = [
      `El usuario pidió: "${String(texto).slice(0, 150)}".`,
      `Acción ejecutada: .${entry.alias[0]}${ctx.esGrupo ? ` en el grupo "${ctx.nombre}"` : ''}.`,
      `Resultado real (code=${res.code}): ${JSON.stringify(d).slice(0, 300)}.`,
      quien ? `La persona afectada es @${quien}: escribe su mención exactamente como @${quien}.` : ''
    ].join(' ');
    out = await narrarHecho(contexto, m.pushName || 'alguien');
  } catch (e) {
    console.error('[agent-narrar]', e?.message || e);
  }
  if (!out) out = fallbackNarracion(res);
  try {
    if (d.mention) {
      await sock.sendMessage(m.chat, { text: out, mentions: [d.mention] }, { quoted: { key: m.key, message: {} } });
    } else {
      await m.reply(out);
    }
  } catch (e) {
    console.error('[agent-narrar-send]', e?.message || e);
  }
}

async function rechazar(sock, m, texto, entry, ctx) {
  const soloOwner = entry.access === 'owner';
  const plantilla = soloOwner
    ? '❍ Eso solo lo usa el *Owner*.'
    : global.mess?.admin || '❍ Este comando solo lo usan los *Admins del grupo*.';
  let out = '';
  try {
    const contexto = `El usuario pidió: "${String(texto).slice(0, 150)}" pero quería usar el comando .${entry.alias[0]} y eso es ${soloOwner ? 'solo para el Owner del bot' : `solo para admins${ctx.esGrupo ? ` del grupo "${ctx.nombre}"` : ''}`}. ${m.pushName || 'El usuario'} no lo es: recházalo con onda en UNA línea corta, sin ejecutar nada.`;
    out = await narrarHecho(contexto, m.pushName || 'alguien');
  } catch (e) {
    console.error('[agent-rechazo]', e?.message || e);
  }
  await m.reply(out || plantilla);
}

export async function tryAgent(sock, m, text, isOwner) {
  const catalogo = buildCatalog();
  const t = norm(text);

  // Conciencia de grupo: "¿cómo se llama el grupo?", "cuántos miembros", "link"
  if (esPreguntaGrupo(t)) {
    try {
      await responderGrupo(sock, m, t, isOwner);
      return true;
    } catch (e) {
      console.error('[agent-grupo]', e?.message || e);
    }
  }

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

  // ── ACCIÓN: match en catálogo → permisos → datos → ejecutar → narrar ──
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

  const ctx = await getContexto(sock, m, isOwner);
  console.log(`[agent] ${m.pushName || m.sender} → ${pick} (${clase}/${ctx.rol}) ${(args.join(' ') || '').slice(0, 60)}`);

  // Modo prueba: solo el owner usa el bot (NL y prefijo)
  if (global.testMode && !isOwner) {
    await m.reply('❍ Bot en *modo prueba*: solo el Owner puede usarme ahora.');
    return true;
  }

  // Permisos: normal solo public · admin public+admin · owner todo
  if (!canUse(entry.access, ctx.rol)) {
    await rechazar(sock, m, text, entry, ctx);
    return true;
  }

  // Grupos: gate inline con el contexto ya cargado (el comando confía en fromAgent)
  if (entry.access === 'admin' || entry.category === 'grupo') {
    if (!ctx.esGrupo) {
      await m.reply('❍ Este comando solo funciona en *grupos*.');
      return true;
    }
    if (!ctx.meta) {
      await m.reply('❍ No pude leer los datos del grupo.');
      return true;
    }
    if (!ctx.botAdmin) {
      await m.reply(global.mess?.botAdmin || '❍ El bot necesita ser *Admin del grupo* para esto.');
      return true;
    }
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
    const res = await cmd.run({
      msg: m, m, sock, args, text: args.join(' '), command: cmd.alias[0] || pick,
      prefix: '.', usedPrefix: '.', isOwner: !!isOwner, fromAgent: true, ...extra
    });
    // Contrato fromAgent: resultado estructurado → la IA narra con personalidad
    if (res && typeof res === 'object' && res.code) {
      await narrarResultado(sock, m, text, entry, ctx, res);
    }
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
