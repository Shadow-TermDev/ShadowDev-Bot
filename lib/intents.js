// Intenciones en lenguaje natural → comandos reales.
// Rápido y determinista (regex). Lo que no matchea va a la IA conversacional.
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
    test: (t) => /(mu[ée]strame|muestra|ver|abre|enseña).{0,20}men[úu]|^men[úu]$|lista de comandos/.test(t),
    run: (sock, m) => runCmd(sock, m, 'menu', [])
  },
  {
    test: (t) => /(descarga|baja|pon|reproduce|reproducir|escuchar|quiero escuchar|ponme)\s+(.+)/.test(t),
    run: (sock, m, t) => {
      const q = (t.match(/(descarga|baja|pon|reproduce|reproducir|escuchar|quiero escuchar|ponme)\s+(.+)/) || [])[2] || '';
      if (!q.trim()) return false;
      return runCmd(sock, m, 'play', q.trim().split(/\s+/));
    }
  },
  {
    test: (t) => /(qu[eé] hora es|dime la hora|la hora)/.test(t),
    run: (sock, m) => runCmd(sock, m, 'hora', [])
  },
  {
    test: (t) => /(cuenta.*chiste|chiste)/.test(t),
    run: (sock, m) => runCmd(sock, m, 'chiste', [])
  },
  {
    test: (t) => /(traduce|traducir)\s+(.+?)\s+(?:al|en)\s+(\w+)\s*$/.test(t),
    run: (sock, m, t) => {
      const mm = t.match(/(traduce|traducir)\s+(.+?)\s+(?:al|en)\s+(\w+)\s*$/);
      if (!mm) return false;
      return runCmd(sock, m, 'translate', [mm[3], ...mm[2].split(/\s+/)]);
    }
  },
  {
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
      if (it.test(t)) {
        console.log(`[intent] ${m.pushName || m.sender}: ${text.slice(0, 60)}`);
        const ok = await it.run(sock, m, t);
        if (ok !== false) return true;
      }
    } catch (e) {
      console.error('[intent]', e?.message || e);
    }
  }
  return false;
}
