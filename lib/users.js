// Mini-DB de usuarios estilo Megumin/Alya (JSON, sin dependencias).
// Guarda: nombre (pushName), apodo (lo que le digan), mensajes, fechas.
import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'data', 'users.json');
let db = {};

function load() {
  try {
    db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch {
    db = {};
  }
}

function save() {
  try {
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    fs.writeFileSync(DB_FILE + '.tmp', JSON.stringify(db, null, 2));
    fs.renameSync(DB_FILE + '.tmp', DB_FILE);
  } catch {}
}

load();

export function getUser(jid) {
  if (!db[jid]) {
    db[jid] = { name: '', apodo: '', edad: '', genero: '', desc: '', msgs: 0, coins: 100, bank: 0, characters: [], firstSeen: Date.now(), lastSeen: 0, lastDaily: 0 };
  }
  const u = db[jid];
  if (u.coins == null) u.coins = 100;
  if (u.bank == null) u.bank = 0;
  if (!Array.isArray(u.characters)) u.characters = [];
  return u;
}

// ¿El usuario ya existía en la BD? (evita crear fantasmas con 100 monedas
// al solo mirar el balance de un número desconocido)
export function existeUser(jid) {
  return !!jid && !!db[jid];
}

export function addCoins(jid, n) {
  const u = getUser(jid);
  u.coins = Math.max(0, (u.coins || 0) + n);
  save();
  return u.coins;
}

// Registra actividad; aprende el pushName solo si no tiene apodo.
export function touchUser(jid, pushName) {
  if (!jid) return null;
  const u = getUser(jid);
  if (pushName && !u.apodo) u.name = pushName;
  u.msgs = (u.msgs || 0) + 1;
  u.lastSeen = Date.now();
  save();
  return u;
}

export function setApodo(jid, apodo) {
  const clean = String(apodo || '').trim().slice(0, 30);
  const low = clean.toLowerCase();
  const reservados = [global.botname, global.botname2, global.dev, 'shadowdev', 'shadowdev-bot']
    .filter(Boolean)
    .map((s) => String(s).toLowerCase());
  if (!clean || reservados.includes(low)) {
    console.log(`[users] apodo ignorado (reservado/vacío): ${clean}`);
    return getUser(jid);
  }
  const u = getUser(jid);
  u.apodo = clean;
  save();
  return u;
}

export function resetUser(jid) {
  delete db[jid];
  save();
}

export function saveUsers() {
  save();
}

export function todosUsuarios() {
  return Object.entries(db);
}

// Nombre para mostrar: apodo > pushName actual > guardado > número
export function displayName(jid, pushName) {
  const u = getUser(jid);
  return u.apodo || pushName || u.name || String(jid || '').split('@')[0];
}
