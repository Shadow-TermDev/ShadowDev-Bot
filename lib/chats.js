// Ajustes por chat (welcome/bye, antilink/antispam, warns). JSON local.
import fs from 'fs';
import path from 'path';

const FILE = path.join(process.cwd(), 'data', 'chats.json');
let db = {};

try {
  db = JSON.parse(fs.readFileSync(FILE, 'utf8'));
} catch {
  db = {};
}

function save() {
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE + '.tmp', JSON.stringify(db, null, 2));
    fs.renameSync(FILE + '.tmp', FILE);
  } catch {}
}

const DEF = {
  welcome: false,
  bye: false,
  welcomeMsg: '',
  byeMsg: '',
  antilink: false,
  antispam: false,
  warnLimit: 3,
  botOff: false,
  economyOff: false,
  gachaOff: false,
  onlyAdmin: false,
  warns: {}
};

export function getChat(id) {
  if (!db[id]) db[id] = { ...DEF, warns: {} };
  const c = db[id];
  for (const k of Object.keys(DEF)) if (c[k] == null) c[k] = k === 'warns' ? {} : DEF[k];
  return c;
}

export function setChat(id, field, val) {
  const c = getChat(id);
  c[field] = val;
  save();
  return c;
}

export function addWarn(id, jid) {
  const c = getChat(id);
  c.warns[jid] = (c.warns[jid] || 0) + 1;
  save();
  return c.warns[jid];
}

export function clearWarns(id, jid) {
  const c = getChat(id);
  delete c.warns[jid];
  save();
}
