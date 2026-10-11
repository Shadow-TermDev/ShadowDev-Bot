/*
  ShadowDev-Bot — configuración principal
  Edita tus números de owner y tu API key, guarda y reinicia.
*/
import fs from 'fs';
import { watchFile, unwatchFile } from 'fs';
import { fileURLToPath } from 'url';

// ── Owners (cambia/agrega tu número con código país, sin +) ──
global.owner = ['51910763332', '51917282040', '51935991809'];

// ── Identidad del bot ──
global.botname = 'ShadowDev-Bot';
global.botname2 = 'ShadowDev';
global.dev = 'Shadow-TermDev';
global.link = 'https://Shadow-TermDev.github.io';

// ── Banner por URL (publicado en tu web, no llena la media de los chats) ──
global.banner = 'https://Shadow-TermDev.github.io/assets/shadowdev-banner.png';

// ── API Stellar (key de Hutao, probada funcional en tu VPS) ──
// Si algún día expira, consigue la tuya gratis en https://api.stellarwa.xyz
global.api = {
  url: 'https://api.stellarwa.xyz',
  key: 'proyectsV2'
};

// ── API secundaria EvoGB (reciclada de Hutao, respaldo para Instagram) ──
global.api2 = {
  url: 'https://api.evogb.org',
  key: 'putostodos'
};

global.msgglobal = '✿⸝꙳.˖ Ocurrió un problema, contacte al creador';
global.mess = {
  socket: '(∩´͈ ᴖ `͈∩ ྀི) Este comando solo puede ser ejecutado por un Socket.',
  admin: '٩ʕ◕౪◕ʔو Este comando solo puede ser ejecutado por los Administradores del Grupo.',
  botAdmin: '(𓂂꜆◕⩊◕꜀𓂂) Este comando solo puede ser ejecutado si el Socket es Administrador del Grupo.',
  owner: '✿ Este comando solo puede ser usado por el Owner.'
};

global.my = {
  ch: '120363407128588763@newsletter'
};

const file = fileURLToPath(import.meta.url);
watchFile(file, () => {
  unwatchFile(file);
  console.log('settings.js actualizado, reinicia el bot.');
  import(`${file}?update=${Date.now()}`);
});
