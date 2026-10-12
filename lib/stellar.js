// Cliente Stellar con rotación de keys (key → key2 si falla).
function keys() {
  return [global.api?.key, global.api?.key2].filter(Boolean);
}

function withKey(path, k) {
  return `${global.api.url}${path}${path.includes('?') ? '&' : '?'}key=${k}`;
}

// JSON: prueba cada key, devuelve el primero con status !== false
export async function sfetch(path, timeoutMs = 25000) {
  let last = 'sin respuesta';
  for (const k of keys()) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), timeoutMs);
      let json = null;
      try {
        json = await (await fetch(withKey(path, k), { signal: ctrl.signal })).json();
      } finally {
        clearTimeout(t);
      }
      if (json && json.status !== false) return json;
      last = json?.message || `key ..${String(k).slice(-4)} sin status`;
    } catch (e) {
      last = e?.message || e;
    }
  }
  throw new Error(last);
}

// Binario (imágenes): primera key que devuelva bytes válidos
export async function sbuffer(path, timeoutMs = 25000) {
  let last = 'sin respuesta';
  for (const k of keys()) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), timeoutMs);
      let buf = null;
      try {
        const res = await fetch(withKey(path, k), { signal: ctrl.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        buf = Buffer.from(await res.arrayBuffer());
      } finally {
        clearTimeout(t);
      }
      if (buf && buf.length > 5000) return buf;
      last = 'vacío';
    } catch (e) {
      last = e?.message || e;
    }
  }
  throw new Error(last);
}
