// Intenciones en lenguaje natural → comandos reales.
// Flujo: ack de la IA ("ya voy") → se ejecuta el comando → su salida confirma.
import { responderBot } from './ia.js';
import { displayName } from './users.js';

function baseCtx(sock, m, args = []) {
  return { msg: m, m, sock, args, text: args.join(' '), command: '', prefix: '.', usedPrefix: '.', isOwner: false };
}

async function runCmd(sock, m, name, args = []) {
  const cmd = global.cmds?.get(name);
  if (!cmd) return false;
  await cmd.run({ ...baseCtx(sock, m, args), command: name });
  return true;
}

const INTENTS = [
  {
    di: 'mostrar el menú',
    test: (t) => /(mu[ée]strame|muestra|ver|abre|enseña).{0,20}men[úu]|^men[úu]$|lista de comandos/.test(t),
    run: (sock, m) => runCmd(sock, m, 'menu', [])
  },
  {
    di: 'buscar en TikTok',
    test: (t) => /(tiktok|\btt\b)/.test(t),
    run: (sock, m, t) => {
      const q = t.replace(/\b(tiktoks?|\btt\b|videos?|de|del|el|la|los|las|un|una|en|por|para|mi|me|un|una)\b/g, ' ').replace(/\s+/g, ' ').trim();
      return runCmd(sock, m, 'tiktok', q ? q.split(' ') : []);
    }
  },
  {
    di: 'descargar ese audio',
    test: (t) => !/(tiktok|\btt\b|twitter|instagram|facebook|spotify)/.test(t) && /(descarga|baja|pon|reproduce|reproducir|escuchar|quiero escuchar|ponme)\s+(.+)/.test(t),
    run: (sock, m, t) => {
      const q = (t.match(/(descarga|baja|pon|reproduce|reproducir|escuchar|quiero escuchar|ponme)\s+(.+)/) || [])[2] || '';
      if (!q.trim()) return false;
      return runCmd(sock, m, 'play', q.trim().split(/\s+/));
    }
  },
  {
    di: 'dar la hora',
    test: (t) => /(qu[eé] hora es|dime la hora|la hora)/.test(t),
    run: (sock, m) => runCmd(sock, m, 'hora', [])
  },
  {
    di: 'contar un chiste',
    test: (t) => /(cuenta.*chiste|chiste)/.test(t),
    run: (sock, m) => runCmd(sock, m, 'chiste', [])
  },
  {
    di: 'traducir eso',
    test: (t) => /(traduce|traducir)\s+(.+?)\s+(?:al|en)\s+([a-záéíóúñü]+)\s*$/.test(t),
    run: (sock, m, t) => {
      const mm = t.match(/(traduce|traducir)\s+(.+?)\s+(?:al|en)\s+([a-záéíóúñü]+)\s*$/);
      if (!mm) return false;
      return runCmd(sock, m, 'translate', [mm[3], ...mm[2].split(/\s+/)]);
    }
  },
  {
    di: 'buscar eso en Wikipedia',
    test: (t) => /(busca|qué es|que es)\s+(.+)/.test(t),
    run: (sock, m, t) => {
      const q = (t.match(/(busca|qué es|que es)\s+(.+)/) || [])[2] || '';
      if (!q.trim()) return false;
      return runCmd(sock, m, 'wiki', q.trim().split(/\s+/));
    }
  }
];

// Devuelve true si alguna intención se ejecutó
export async function tryIntent(sock, m, text) {
  const t = String(text || '').toLowerCase();
  for (const it of INTENTS) {
    try {
      if (!it.test(t)) continue;
      console.log(`[intent] ${m.pushName || m.sender}: ${text.slice(0, 60)}`);
      const nombre = displayName(m.sender, m.pushName);
      try {
        const ack = await responderBot(`El usuario pidió: "${text.slice(0, 200)}". Vas a intentar: ${it.di}. Avísale en UNA línea corta que ya vas con eso.`, nombre);
        await m.reply(ack || '> ✦ _En camino..._');
      } catch {
        await m.reply('> ✦ _En camino..._');
      }
      const ok = await it.run(sock, m, t);
      if (ok !== false) return true;
    } catch (e) {
      console.error('[intent]', e?.message || e);
    }
  }
  return false;
}
