// Config global persistente (data/config.json). Sin DB pesada.
import fs from 'fs';
import path from 'path';

const FILE = path.join(process.cwd(), 'data', 'config.json');
const DEF = { moneda: 'moras' };
let cfg = null;

export function getConfig() {
  if (!cfg) {
    try {
      cfg = { ...DEF, ...JSON.parse(fs.readFileSync(FILE, 'utf8')) };
    } catch {
      cfg = { ...DEF };
    }
  }
  return cfg;
}

export function setConfig(field, val) {
  const c = getConfig();
  c[field] = val;
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(c, null, 2));
  } catch {}
  return c;
}
