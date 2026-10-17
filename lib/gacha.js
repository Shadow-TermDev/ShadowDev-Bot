// Gacha + economía (estilo Hutao, sin APIs de pago).
// Catálogo: lib/characters.json · Estado: data/gacha.json · Monedas: lib/users.js
import fs from 'fs';
import path from 'path';
import { displayName, getUser, todosUsuarios } from './users.js';
import { baseJid } from './grupo.js';

const GACHA_FILE = path.join(process.cwd(), 'data', 'gacha.json');
const CHARS_FILE = path.join(process.cwd(), 'lib', 'characters.json');

let catalogo = null;
let gacha = null;

function loadGacha() {
  try {
    gacha = JSON.parse(fs.readFileSync(GACHA_FILE, 'utf8'));
  } catch {
    gacha = { rolled: {}, cds: {} };
  }
  if (!gacha.rolled) gacha.rolled = {};
  if (!gacha.cds) gacha.cds = {};
}

function saveGacha() {
  try {
    fs.mkdirSync(path.dirname(GACHA_FILE), { recursive: true });
    fs.writeFileSync(GACHA_FILE + '.tmp', JSON.stringify(gacha, null, 2));
    fs.renameSync(GACHA_FILE + '.tmp', GACHA_FILE);
  } catch {}
}

loadGacha();

export function getTrade(chat) {
  const t = gacha.trades?.[chat];
  if (!t || Date.now() - t.at > 10 * 60 * 1000) return null;
  return t;
}

export function setTrade(chat, trade) {
  gacha.trades ||= {};
  gacha.trades[chat] = { ...trade, at: Date.now() };
  saveGacha();
}

export function clearTrade(chat) {
  if (gacha.trades) delete gacha.trades[chat];
  saveGacha();
}

export function votar(nombre, jid) {
  gacha.votes ||= {};
  gacha.votes[nombre] ||= [];
  if (gacha.votes[nombre].includes(jid)) return false;
  gacha.votes[nombre].push(jid);
  saveGacha();
  return gacha.votes[nombre].length;
}

export function personajes() {
  if (!catalogo) {
    try {
      catalogo = JSON.parse(fs.readFileSync(CHARS_FILE, 'utf8'));
    } catch {
      catalogo = [];
    }
  }
  return catalogo;
}

export function tirar() {
  const all = personajes();
  return all[Math.floor(Math.random() * all.length)] || null;
}

export const RW_COOLDOWN = 3 * 60 * 1000;
export const ROLL_TTL = 5 * 60 * 1000;

export function puedeTirar(jid) {
  const queda = (gacha.cds[jid] || 0) - Date.now();
  return queda > 0 ? queda : 0;
}

export function marcarTiro(jid) {
  gacha.cds[jid] = Date.now() + RW_COOLDOWN;
  saveGacha();
}

export function setRoll(chat, personaje, by) {
  gacha.rolled[chat] = { ...personaje, by, at: Date.now(), claimedBy: null };
  saveGacha();
}

export function getRoll(chat) {
  const r = gacha.rolled[chat];
  if (!r || Date.now() - r.at > ROLL_TTL) return null;
  return r;
}

export function claimRoll(chat, jid) {
  const r = getRoll(chat);
  if (!r || r.claimedBy) return null;
  if (r.by && baseJid(r.by) === baseJid(jid)) return null; // no reclamar tu propio tiro
  r.claimedBy = jid;
  saveGacha();
  return r;
}

// Búsqueda de personaje en una lista: exacto → prefijo → includes.
// Evita vender/regalar el personaje equivocado por orden del array.
export function buscarPersonaje(lista, q) {
  const s = String(q || '').toLowerCase().trim();
  if (!s) return -1;
  const arr = lista || [];
  let i = arr.findIndex((c) => String(c.name || '').toLowerCase() === s);
  if (i >= 0) return i;
  i = arr.findIndex((c) => String(c.name || '').toLowerCase().startsWith(s));
  if (i >= 0) return i;
  return arr.findIndex((c) => String(c.name || '').toLowerCase().includes(s));
}

// Quita (y persiste) un personaje de un usuario por nombre exacto.
export function quitarPersonaje(jid, nombre) {
  const u = getUser(jid);
  const i = (u.characters || []).findIndex((c) => c.name === nombre);
  if (i < 0) return null;
  const [p] = u.characters.splice(i, 1);
  return p;
}

// ¿Quién tiene este personaje? (busca en todos los usuarios)
export function duenoDe(nombre) {
  for (const [jid, u] of todosUsuarios()) {
    if ((u.characters || []).some((c) => c.name === nombre)) {
      return { jid, nombre: displayName(jid, u.apodo || u.name) };
    }
  }
  return null;
}

// Imagen SFW por keyword (safebooru → gelbooru con rating seguro)
const UA = 'Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36';

export async function imagenDe(keyword) {
  const tag = encodeURIComponent(keyword || '');
  try {
    const r = await fetch(`https://safebooru.org/index.php?page=dapi&s=post&q=index&json=1&tags=${tag}&limit=5`, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(20000) }).then((x) => x.json());
    const post = (r || []).find((p) => p.file_url || p.sample_url);
    const url = post?.file_url || post?.sample_url;
    if (url) return url.startsWith('http') ? url : `https://safebooru.org${url}`;
  } catch {}
  try {
    const r = await fetch(`https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&tags=${tag}+rating:safe&limit=5`, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(20000) }).then((x) => x.json());
    const post = (r?.post || []).find((p) => p.file_url);
    if (post?.file_url) return post.file_url.startsWith('http') ? post.file_url : `https://gelbooru.com${post.file_url}`;
  } catch {}
  return null;
}

export function msCorto(ms) {
  const s = Math.ceil(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}
